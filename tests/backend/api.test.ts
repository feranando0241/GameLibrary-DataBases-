// Backend HTTP contract: the endpoints api.ts calls in phase 3. Skips when MySQL is unreachable.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../../backend/index.ts';
import { pool } from '../../backend/db.ts';
import type { Game, Library, UserGame } from '../../backend/types.ts';

let server: Server | undefined;
let base = '';
let skip: string | false = false;

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
});

after(async () => {
  if (server !== undefined) await new Promise<void>((resolve) => server?.close(() => resolve()));
  await pool.end();
});

const get = (path: string): Promise<Response> => fetch(`${base}${path}`);

const patch = (path: string, body: unknown): Promise<Response> =>
  fetch(`${base}${path}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

test('GET /api/games returns the catalog with genres and computed stats', { skip }, async () => {
  const res = await get('/api/games');
  assert.equal(res.status, 200);

  const games = (await res.json()) as Game[];
  assert.ok(games.length > 0);

  const game = games.find((candidate) => candidate.id === 'elden-ring');
  assert.ok(game);
  assert.equal(typeof game.title, 'string');
  assert.ok(Array.isArray(game.genres));
  assert.ok(game.genres.includes('Souls-like'));
  assert.equal(typeof game.averageScore, 'number');
  assert.equal(typeof game.popularity, 'number');
  assert.equal(typeof game.storageGb, 'number');
  assert.equal(typeof game.achievementsTotal, 'number');
  assert.equal(typeof game.releaseYear, 'number');
});

test('GET /api/me/games returns an object keyed by game id, not an array', { skip }, async () => {
  const res = await get('/api/me/games');
  assert.equal(res.status, 200);

  const library = (await res.json()) as Library;
  assert.ok(!Array.isArray(library));

  const ids = Object.keys(library);
  assert.ok(ids.length > 0);
  for (const id of ids) assert.equal(library[id].gameId, id);

  const row = library[ids[0]];
  assert.equal(typeof row.isFavorite, 'boolean');
  assert.equal(typeof row.hoursPlayed, 'number');
  assert.equal(typeof row.updatedAt, 'string');
});

test('PATCH merges onto the stored row, so edits to different fields never overwrite each other', { skip }, async () => {
  const gameId = 'starfield';

  const favorite = await patch(`/api/me/games/${gameId}`, { isFavorite: true });
  assert.equal(favorite.status, 200);

  const res = await patch(`/api/me/games/${gameId}`, { status: 'PAUSED', notes: 'más tarde' });
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.isFavorite, true);
  assert.equal(saved.status, 'PAUSED');
  assert.equal(saved.notes, 'más tarde');
  assert.equal(saved.gameId, gameId);
  assert.notEqual(saved.updatedAt, '');
});

test('hours and score come back as numbers on the next read (single source of truth)', { skip }, async () => {
  const res = await patch('/api/me/games/doom-eternal', {
    status: 'CURRENT',
    hoursPlayed: 12.5,
    score: 90,
  });
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.hoursPlayed, 12.5);
  assert.equal(saved.score, 90);

  const library = (await (await get('/api/me/games')).json()) as Library;
  assert.equal(library['doom-eternal'].hoursPlayed, 12.5);
});

test('stop tracking nulls status, score and notes but keeps hours and favorite', { skip }, async () => {
  await patch('/api/me/games/doom-eternal', { isFavorite: true, hoursPlayed: 30 });

  const res = await patch('/api/me/games/doom-eternal', { status: null, score: null, notes: null });
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.status, null);
  assert.equal(saved.score, null);
  assert.equal(saved.notes, null);
  assert.equal(saved.hoursPlayed, 30);
  assert.equal(saved.isFavorite, true);
});

test('a game without a row starts from the user_games column defaults', { skip }, async () => {
  const gameId = 'civilization-7';
  await pool.execute('DELETE FROM user_games WHERE user_id = 1 AND game_id = ?', [gameId]);

  const res = await patch(`/api/me/games/${gameId}`, { hoursPlayed: 3 });
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.gameId, gameId);
  assert.equal(saved.status, null);
  assert.equal(saved.score, null);
  assert.equal(saved.isFavorite, false);
  assert.equal(saved.isInstalled, false);
  assert.equal(saved.achievementsUnlocked, 0);
  assert.equal(saved.hoursPlayed, 3);
});

test('PATCH rejects an unknown game with 404', { skip }, async () => {
  const res = await patch('/api/me/games/no-existe', { status: 'CURRENT' });
  assert.equal(res.status, 404);
  assert.equal(typeof ((await res.json()) as { error: string }).error, 'string');
});

test('PATCH rejects values the schema forbids with 400', { skip }, async () => {
  const score = await patch('/api/me/games/hades-2', { score: 150 });
  assert.equal(score.status, 400);

  const status = await patch('/api/me/games/hades-2', { status: 'BOGUS' });
  assert.equal(status.status, 400);

  const hours = await patch('/api/me/games/hades-2', { hoursPlayed: -1 });
  assert.equal(hours.status, 400);
});

test('unknown routes answer 404 with a JSON error', { skip }, async () => {
  const res = await get('/api/no-existe');
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Ruta no encontrada' });
});

test('malformed JSON answers 400 instead of crashing the process', { skip }, async () => {
  const res = await fetch(`${base}/api/me/games/elden-ring`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'JSON inválido' });
});

test('an empty body leaves the stored row untouched', { skip }, async () => {
  const before = (await (await get('/api/me/games')).json()) as Library;

  const res = await patch('/api/me/games/elden-ring', {});
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.gameId, 'elden-ring');
  assert.equal(saved.hoursPlayed, before['elden-ring'].hoursPlayed);
  assert.equal(saved.status, before['elden-ring'].status);
  assert.equal(saved.score, before['elden-ring'].score);
});

test('server-owned fields in the body are ignored', { skip }, async () => {
  const res = await patch('/api/me/games/elden-ring', {
    gameId: 'hades-2',
    updatedAt: '1999-01-01T00:00:00.000Z',
    notes: 'no me cambies el id',
  });
  assert.equal(res.status, 200);

  const saved = (await res.json()) as UserGame;
  assert.equal(saved.gameId, 'elden-ring');
  assert.notEqual(saved.updatedAt, '1999-01-01T00:00:00.000Z');
  assert.equal(saved.notes, 'no me cambies el id');
});

test('PATCH rejects wrong field types with 400', { skip }, async () => {
  const cases: Record<string, unknown>[] = [
    { notes: 42 },
    { isFavorite: 'yes' },
    { lastPlayedAt: 'no-es-una-fecha' },
    { achievementsUnlocked: 1.5 },
    { status: 7 },
  ];

  for (const body of cases) {
    const res = await patch('/api/me/games/hades-2', body);
    assert.equal(res.status, 400, `debió rechazar ${JSON.stringify(body)}`);
    assert.equal(typeof ((await res.json()) as { error: string }).error, 'string');
  }
});

test('repeating the same PATCH is idempotent for the writable fields', { skip }, async () => {
  const body = { status: 'COMPLETED', score: 88, hoursPlayed: 40.5, notes: 'terminado' };

  const first = (await (await patch('/api/me/games/hades-2', body)).json()) as UserGame;
  const second = (await (await patch('/api/me/games/hades-2', body)).json()) as UserGame;

  assert.deepEqual({ ...second, updatedAt: '' }, { ...first, updatedAt: '' });
});

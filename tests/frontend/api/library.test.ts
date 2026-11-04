// Data-access contract (frontend/src/shared/api/api.ts). The phase-3 fetch implementation must keep passing these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGames, getLibrary, newUserGame, saveUserGame } from '../../../frontend/src/shared/api/api.ts';

test('saving a row returns it and later reads see it (single source for hours, review H2)', async () => {
  const [game] = await getGames();
  const saved = await saveUserGame(game.id, { status: 'CURRENT', hoursPlayed: 12.5 });
  assert.equal(saved.hoursPlayed, 12.5);
  assert.notEqual(saved.updatedAt, '');
  assert.equal((await getLibrary())[game.id].hoursPlayed, 12.5);
});

test('saves merge onto the stored row, so edits to different fields never overwrite each other', async () => {
  const [, game] = await getGames();
  await saveUserGame(game.id, { isFavorite: true });
  const saved = await saveUserGame(game.id, { status: 'PAUSED', notes: 'later' });
  assert.equal(saved.isFavorite, true);
  assert.equal(saved.status, 'PAUSED');
  assert.equal(saved.gameId, game.id);
});

test('reads return copies, so callers cannot mutate the store', async () => {
  const lib = await getLibrary();
  const id = Object.keys(lib)[0];
  lib[id].hoursPlayed = -1;
  assert.notEqual((await getLibrary())[id].hoursPlayed, -1);
});

test('new rows use the user_games column defaults', () => {
  const row = newUserGame('x');
  assert.deepEqual(
    { ...row, updatedAt: '' },
    {
      gameId: 'x',
      status: null,
      score: null,
      hoursPlayed: 0,
      isFavorite: false,
      isInstalled: false,
      achievementsUnlocked: 0,
      notes: null,
      lastPlayedAt: null,
      updatedAt: '',
    }
  );
});

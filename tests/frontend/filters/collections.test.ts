// Sidebar collections (frontend/src/features/library/collections.ts) and their badge counts (filters.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTIONS } from '../../../frontend/src/features/library/collections.ts';
import { countCategories, countCollections, countStatuses } from '../../../frontend/src/features/library/filters.ts';
import { games, ids, library } from '../fixtures.ts';
import { newUserGame } from '../../../frontend/src/shared/api/api.ts';

test('special collections: Shooter includes FPS, Backlog means unplayed', () => {
  assert.deepEqual(ids({ collection: 'Shooter' }), ['doom', 'halo']);
  assert.deepEqual(ids({ collection: 'Backlog' }), ['new']);
});

test('sidebar counts always match the collection filter', () => {
  const counts = countCollections(games, library);
  for (const c of COLLECTIONS) assert.equal(counts[c.id], ids({ collection: c.id }).length, c.id);
});

test('status counts include every status and skip rows without one', () => {
  assert.deepEqual(countStatuses(games, library), { CURRENT: 1, PLANNING: 0, COMPLETED: 0, PAUSED: 0, DROPPED: 1 });
});

test('a game with logged hours leaves the Backlog even if lastPlayedAt was never set', () => {
  const backlog = COLLECTIONS.find((c) => c.id === 'Backlog')!;
  assert.equal(backlog.matches(games[3], { ...newUserGame('new'), hoursPlayed: 40 }), false);
  assert.equal(backlog.matches(games[3], newUserGame('new')), true);
});

test('category and status badges only count catalog games, so they always add up', () => {
  const withOrphan = { ...library, gone: { ...newUserGame('gone'), status: 'CURRENT' as const, isFavorite: true } };
  const categories = countCategories(games, withOrphan);
  assert.deepEqual(categories, { all: 4, 'my-games': ids({ category: 'my-games' }).length, favorites: ids({ category: 'favorites' }).length });
  const statuses = Object.values(countStatuses(games, withOrphan)).reduce((a, b) => a + b, 0);
  assert.equal(statuses, categories['my-games']);
});

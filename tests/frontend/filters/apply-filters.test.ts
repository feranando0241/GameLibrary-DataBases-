// applyFilters (src/lib/filters.ts): the library's WHERE + ORDER BY.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids } from '../fixtures.ts';

test('default view sorts by score, highest first', () => {
  assert.deepEqual(ids(), ['hades', 'doom', 'halo', 'new']);
});

test('sidebar categories', () => {
  assert.deepEqual(ids({ category: 'favorites' }), ['doom']);
  assert.deepEqual(ids({ category: 'my-games' }), ['hades', 'halo']);
  assert.deepEqual(ids({ category: 'my-games', trackingStatus: 'DROPPED' }), ['halo']);
});

test('filter bar: year buckets, platform, search', () => {
  assert.deepEqual(ids({}, { year: '2010s' }), ['doom']);
  assert.deepEqual(ids({}, { platform: 'Xbox Series X' }), ['halo']);
  assert.deepEqual(ids({}, { search: '  ROGUE ' }), ['hades']);
});

test('sorting: title ascending, hours from the user row (no row counts as 0)', () => {
  assert.deepEqual(ids({}, { year: '2020s', sort: 'TITLE_ASC' }), ['new', 'hades', 'halo']);
  assert.deepEqual(ids({}, { sort: 'HOURS_DESC' }), ['hades', 'doom', 'halo', 'new']);
});

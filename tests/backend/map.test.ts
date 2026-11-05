// Pure row → wire mapping. No database, so these tests always run and catch
// accidental changes to the contract shared with the frontend.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toGame, toIso, toSqlDateTime, toUserGame } from '../../backend/map.ts';
import type { GameRow, UserGameRow } from '../../backend/map.ts';

const gameRow = (overrides: Partial<GameRow> = {}): GameRow => ({
  id: 'g1',
  title: 'Game One',
  developer: 'Dev',
  publisher: 'Pub',
  release_year: 2024,
  format: 'PC',
  cover_url: 'cover',
  banner_url: 'banner',
  storage_gb: 12.5,
  achievements_total: 30,
  summary: 'Summary',
  genres: 'Action,RPG',
  average_score: 87,
  popularity: 3,
  ...overrides,
});

const userRow = (overrides: Partial<UserGameRow> = {}): UserGameRow => ({
  game_id: 'g1',
  status: 'CURRENT',
  score: null,
  hours_played: 7.5,
  is_favorite: 1,
  is_installed: 0,
  achievements_unlocked: 4,
  notes: null,
  last_played_at: null,
  updated_at: '2024-03-09 21:15:30',
  ...overrides,
});

test('toIso treats MySQL DATETIME as UTC and keeps nulls', () => {
  assert.equal(toIso(null), null);
  assert.equal(toIso('2024-03-09 21:15:30'), '2024-03-09T21:15:30.000Z');
});

test('toSqlDateTime converts ISO back to the MySQL DATETIME format', () => {
  assert.equal(toSqlDateTime('2024-03-09T21:15:30.000Z'), '2024-03-09 21:15:30');
  assert.equal(toSqlDateTime('2024-03-09T23:15:30+02:00'), '2024-03-09 21:15:30');
});

test('toGame maps snake_case to camelCase and splits genres', () => {
  assert.deepEqual(toGame(gameRow()), {
    id: 'g1',
    title: 'Game One',
    developer: 'Dev',
    publisher: 'Pub',
    releaseYear: 2024,
    bannerUrl: 'banner',
    coverUrl: 'cover',
    storageGb: 12.5,
    genres: ['Action', 'RPG'],
    averageScore: 87,
    popularity: 3,
    format: 'PC',
    achievementsTotal: 30,
    summary: 'Summary',
  });
});

test('toGame returns an empty genres array when the game has none', () => {
  assert.deepEqual(toGame(gameRow({ genres: null })).genres, []);
});

test('toUserGame converts 0/1 flags to booleans and keeps nulls', () => {
  const userGame = toUserGame(userRow());

  assert.equal(userGame.gameId, 'g1');
  assert.equal(userGame.status, 'CURRENT');
  assert.equal(userGame.score, null);
  assert.equal(userGame.hoursPlayed, 7.5);
  assert.equal(userGame.isFavorite, true);
  assert.equal(userGame.isInstalled, false);
  assert.equal(userGame.achievementsUnlocked, 4);
  assert.equal(userGame.notes, null);
  assert.equal(userGame.lastPlayedAt, null);
  assert.equal(userGame.updatedAt, '2024-03-09T21:15:30.000Z');
});

test('toUserGame converts a stored last_played_at to ISO UTC', () => {
  assert.equal(
    toUserGame(userRow({ last_played_at: '2024-01-02 03:04:05' })).lastPlayedAt,
    '2024-01-02T03:04:05.000Z'
  );
});

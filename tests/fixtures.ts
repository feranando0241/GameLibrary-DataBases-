// Shared test data. Small and hand-written so every expected result can be checked by eye.
import type { Game, Library } from '../src/types/game';
import { newUserGame } from '../src/lib/api.ts';
import { DEFAULT_FILTERS, applyFilters, type LibraryQuery } from '../src/lib/filters.ts';

export const game = (id: string, over: Partial<Game> = {}): Game => ({
  id,
  title: id,
  developer: 'Dev',
  publisher: 'Pub',
  releaseYear: 2023,
  bannerUrl: '',
  coverUrl: '',
  storageGb: 1,
  genres: [],
  averageScore: 50,
  popularity: 0,
  format: 'PC',
  achievementsTotal: 0,
  summary: '',
  ...over,
});

export const games = [
  game('doom', { title: 'Doom', genres: ['FPS', 'Action'], releaseYear: 2016, averageScore: 88 }),
  game('halo', { title: 'Halo', genres: ['Shooter'], releaseYear: 2021, averageScore: 84, format: 'Xbox Series X' }),
  game('hades', { title: 'Hades', genres: ['Roguelike', 'Indie'], releaseYear: 2020, averageScore: 93 }),
  game('new', { title: 'Brand New', genres: ['RPG'], averageScore: 70 }), // no user row: unplayed
];

const played = { hoursPlayed: 1, lastPlayedAt: '2026-11-01T00:00:00.000Z' };

export const library: Library = {
  doom: { ...newUserGame('doom'), ...played, isFavorite: true }, // favorite, not in My Games
  hades: { ...newUserGame('hades'), ...played, status: 'CURRENT', score: 95, hoursPlayed: 40 },
  halo: { ...newUserGame('halo'), ...played, status: 'DROPPED', score: 60 },
};

/** Runs applyFilters over the fixtures and returns the resulting ids, in order. */
export const ids = (q: Partial<LibraryQuery> = {}, filters: Partial<LibraryQuery['filters']> = {}) =>
  applyFilters(games, library, {
    category: 'all',
    collection: null,
    trackingStatus: null,
    ...q,
    filters: { ...DEFAULT_FILTERS, ...filters },
  }).map((g) => g.id);

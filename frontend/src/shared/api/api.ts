import type { Game, Library, UserGame } from '../domain/game';
import { mockGames } from './mocks/mockGames.ts';
import { mockLibrary } from './mocks/mockLibrary.ts';

/**
 * The only module that knows where data comes from (ADR-0001).
 * Phase 3 replaces each body with a fetch to the endpoint in its comment; signatures stay the same,
 * so nothing outside this file changes.
 */

// ponytail: in-memory store, resets on reload; replaced by the MySQL-backed API in phase 3
let library: Library = structuredClone(mockLibrary);

/** GET /api/games: the catalog with genres and computed stats. */
export async function getGames(): Promise<Game[]> {
  return structuredClone(mockGames);
}

/** GET /api/me/games: the current user's user_games rows. */
export async function getLibrary(): Promise<Library> {
  return structuredClone(library);
}

/**
 * PATCH /api/me/games/:gameId: merge `changes` onto the stored row (or the column defaults), return it as stored.
 * Merging here, not in the UI, means concurrent edits to different fields can't overwrite each other.
 */
export async function saveUserGame(gameId: string, changes: Partial<UserGame>): Promise<UserGame> {
  const saved: UserGame = { ...(library[gameId] ?? newUserGame(gameId)), ...changes, gameId, updatedAt: new Date().toISOString() };
  library = { ...library, [gameId]: saved };
  return structuredClone(saved);
}

/** Column defaults of `user_games`, for a game the user hasn't touched yet. */
export const newUserGame = (gameId: string): UserGame => ({
  gameId,
  status: null,
  score: null,
  hoursPlayed: 0,
  isFavorite: false,
  isInstalled: false,
  achievementsUnlocked: 0,
  notes: null,
  lastPlayedAt: null,
  updatedAt: new Date().toISOString(),
});

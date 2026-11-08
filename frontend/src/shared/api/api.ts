import type { Game, Library, UserGame } from '../domain/game';

/**
 * The only module that knows where data comes from (ADR-0001).
 * Requests use relative /api URLs; Vite proxies them to the Express server in dev
 * (vite.config.ts), so the browser never needs CORS.
 */

/** Fetches JSON and turns a non-2xx response into an Error carrying the API message. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

/** GET /api/games: the catalog with genres and computed stats. */
export async function getGames(): Promise<Game[]> {
  return request<Game[]>('/games');
}

/** GET /api/me/games: the current user's user_games rows. */
export async function getLibrary(): Promise<Library> {
  return request<Library>('/me/games');
}

/**
 * PATCH /api/me/games/:gameId: merge `changes` onto the stored row (or the column defaults), return it as stored.
 * Merging on the server, not in the UI, means concurrent edits to different fields can't overwrite each other.
 */
export async function saveUserGame(gameId: string, changes: Partial<UserGame>): Promise<UserGame> {
  return request<UserGame>(`/me/games/${encodeURIComponent(gameId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(changes),
  });
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

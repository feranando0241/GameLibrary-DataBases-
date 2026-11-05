/**
 * Wire contract shared with the frontend over HTTP only (ADR-0001).
 * These types mirror `frontend/src/shared/domain/game.ts`; the two sides never import each other.
 */

/** Mirrors the `games.format` ENUM. Order = display order. */
export const GAME_FORMATS = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Steam Deck'] as const;
export type GameFormat = (typeof GAME_FORMATS)[number];

/** Mirrors the `user_games.status` ENUM. */
export const TRACKING_STATUSES = ['CURRENT', 'PLANNING', 'COMPLETED', 'PAUSED', 'DROPPED'] as const;
export type UserTrackingStatus = (typeof TRACKING_STATUSES)[number];

/** Catalog row: `games` + its genres + the `game_stats` view. The same for every user. */
export interface Game {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  bannerUrl: string;
  coverUrl: string;
  storageGb: number;
  genres: string[];
  averageScore: number;
  popularity: number;
  format: GameFormat;
  achievementsTotal: number;
  summary: string;
}

/** The current user's row in `user_games`. */
export interface UserGame {
  gameId: string;
  status: UserTrackingStatus | null;
  score: number | null;
  hoursPlayed: number;
  isFavorite: boolean;
  isInstalled: boolean;
  achievementsUnlocked: number;
  notes: string | null;
  lastPlayedAt: string | null;
  updatedAt: string;
}

/** The current user's `user_games` rows, keyed by game id. */
export type Library = Record<string, UserGame>;

/** Fields a client may send on PATCH; `gameId` and `updatedAt` are server-owned. */
export type WritableUserGame = Omit<UserGame, 'gameId' | 'updatedAt'>;

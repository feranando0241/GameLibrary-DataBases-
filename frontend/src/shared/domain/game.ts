/** Top-level sidebar sections. */
export type FilterCategory = 'all' | 'my-games' | 'favorites';
/** Mirrors the `user_games.status` ENUM. */
export type UserTrackingStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'PAUSED' | 'DROPPED';

/** Mirrors the `games.format` ENUM in the database. Order = display order. */
export const GAME_FORMATS = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Steam Deck'] as const;
export type GameFormat = (typeof GAME_FORMATS)[number];

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
  averageScore: number; // 0-100, computed by game_stats
  popularity: number; // computed by game_stats
  format: GameFormat;
  achievementsTotal: number;
  summary: string;
}

/**
 * The current user's row in `user_games`: the single source for everything personal about a game.
 * A row can exist without a status (e.g. a favorite that isn't in My Games).
 */
export interface UserGame {
  gameId: string;
  status: UserTrackingStatus | null; // null = not in My Games
  score: number | null; // 0-100
  hoursPlayed: number;
  isFavorite: boolean;
  isInstalled: boolean;
  achievementsUnlocked: number;
  notes: string | null;
  lastPlayedAt: string | null; // ISO 8601 UTC; null = never played
  updatedAt: string; // ISO 8601 UTC
}

/** The current user's `user_games` rows, keyed by game id. */
export type Library = Record<string, UserGame>;

/** Fields the library can be sorted by (see SORTS in lib/filters.ts). */
export type SortField = 'title' | 'averageScore' | 'hoursPlayed' | 'releaseYear' | 'popularity';
export type SortDirection = 'asc' | 'desc';

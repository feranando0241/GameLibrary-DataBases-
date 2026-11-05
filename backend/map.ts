// Row → wire mapping: snake_case → camelCase, 0/1 → boolean, DECIMAL → number, DATETIME → ISO UTC.
import type { Game, GameFormat, UserGame, UserTrackingStatus } from './types.ts';

/** MySQL DATETIME (stored as UTC, no zone) → ISO 8601. */
export function toIso(value: string | null): string | null {
  if (value === null) return null;
  return new Date(`${value.replace(' ', 'T')}Z`).toISOString();
}

/** MySQL DATETIME → 'YYYY-MM-DD HH:mm:ss' in UTC, ready for a `?` placeholder. */
export function toSqlDateTime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
}

export interface GameRow {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  release_year: number;
  format: GameFormat;
  cover_url: string;
  banner_url: string;
  storage_gb: number;
  achievements_total: number;
  summary: string;
  genres: string | null;
  average_score: number;
  popularity: number;
}

export interface UserGameRow {
  game_id: string;
  status: UserTrackingStatus | null;
  score: number | null;
  hours_played: number;
  is_favorite: number;
  is_installed: number;
  achievements_unlocked: number;
  notes: string | null;
  last_played_at: string | null;
  updated_at: string;
}

export function toGame(row: GameRow): Game {
  return {
    id: row.id,
    title: row.title,
    developer: row.developer,
    publisher: row.publisher,
    releaseYear: Number(row.release_year),
    bannerUrl: row.banner_url,
    coverUrl: row.cover_url,
    storageGb: Number(row.storage_gb),
    genres: row.genres === null ? [] : row.genres.split(','),
    averageScore: Number(row.average_score),
    popularity: Number(row.popularity),
    format: row.format,
    achievementsTotal: Number(row.achievements_total),
    summary: row.summary,
  };
}

export function toUserGame(row: UserGameRow): UserGame {
  return {
    gameId: row.game_id,
    status: row.status,
    score: row.score === null ? null : Number(row.score),
    hoursPlayed: Number(row.hours_played),
    isFavorite: Number(row.is_favorite) === 1,
    isInstalled: Number(row.is_installed) === 1,
    achievementsUnlocked: Number(row.achievements_unlocked),
    notes: row.notes,
    lastPlayedAt: toIso(row.last_played_at),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

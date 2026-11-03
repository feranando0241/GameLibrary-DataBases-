export type ViewMode = 'grid' | 'list' | 'detail';
export type FilterCategory = 'all' | 'my-games' | 'favorites';
export type UserTrackingStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
export type GameFormat = 'PC' | 'PlayStation 5' | 'Xbox Series X' | 'Nintendo Switch' | 'Steam Deck';

export interface Game {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  bannerUrl: string;
  coverUrl: string;
  isInstalled: boolean;
  isFavorite: boolean;
  hoursPlayed: number;
  lastPlayed: string;
  storageGb: number;
  genres: string[];
  averageScore: number; // 0-100
  popularity: number;
  format: GameFormat;
  achievements: {
    unlocked: number;
    total: number;
  };
  summary: string;
}

export interface UserTrackEntry {
  gameId: string;
  status: UserTrackingStatus;
  score: number; // 0-100
  progress: number; // Hours played
  notes?: string;
  updatedAt: string;
}

export type SortField = 'title' | 'averageScore' | 'hoursPlayed' | 'storageGb' | 'releaseYear' | 'popularity';
export type SortDirection = 'asc' | 'desc';

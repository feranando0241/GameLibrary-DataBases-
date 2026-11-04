// Runtime imports in lib/ use explicit .ts extensions so `node --test` can load them without a bundler.
import type {
  FilterCategory,
  Game,
  GameFormat,
  Library,
  SortDirection,
  SortField,
  UserGame,
  UserTrackingStatus,
} from '../types/game';
import { COLLECTION, COLLECTIONS, hasGenre } from './collections.ts';
import { STATUSES } from './status.ts';

/** Sort options. Order = dropdown order. `field`/`dir` also drive the list view's column headers. */
export const SORTS = [
  { id: 'SCORE_DESC', label: 'Top Rated', field: 'averageScore', dir: 'desc' },
  { id: 'HOURS_DESC', label: 'Most Played', field: 'hoursPlayed', dir: 'desc' },
  { id: 'POPULARITY_DESC', label: 'Most Popular', field: 'popularity', dir: 'desc' },
  { id: 'TITLE_ASC', label: 'Title A–Z', field: 'title', dir: 'asc' },
  { id: 'YEAR_DESC', label: 'Newest', field: 'releaseYear', dir: 'desc' },
] as const satisfies readonly { id: string; label: string; field: SortField; dir: SortDirection }[];

export type SortKey = (typeof SORTS)[number]['id'];
export const SORT = Object.fromEntries(SORTS.map((s) => [s.id, s])) as Record<SortKey, (typeof SORTS)[number]>;

/** Release-year options. Order = dropdown order. */
export const YEARS = [
  { id: '2025', label: '2025 (Upcoming)' },
  { id: '2024', label: '2024' },
  { id: '2023', label: '2023' },
  { id: '2020s', label: '2020s' },
  { id: '2010s', label: '2010s & Older' },
] as const;

export type YearFilter = (typeof YEARS)[number]['id'];

/** Filter bar state. When the database lands, this maps to the query params. */
export interface FilterBarState {
  search: string;
  genre: string;
  year: YearFilter | '';
  platform: GameFormat | '';
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterBarState = {
  search: '',
  genre: '',
  year: '',
  platform: '',
  sort: 'SCORE_DESC',
};

/** Everything that narrows the library view: sidebar selection + filter bar. */
export interface LibraryQuery {
  category: FilterCategory;
  collection: string | null;
  trackingStatus: UserTrackingStatus | null;
  filters: FilterBarState;
}

/** Sort value for a column; hours come from the user's row, everything else from the catalog. */
const sortValue = (g: Game, ug: UserGame | undefined, field: SortField) =>
  field === 'hoursPlayed' ? (ug?.hoursPlayed ?? 0) : g[field];

/** Sidebar category rule, shared by the filter and the badge counts so they can't disagree. */
const inCategory = (category: FilterCategory, ug: UserGame | undefined) =>
  category === 'all' || (category === 'favorites' ? Boolean(ug?.isFavorite) : Boolean(ug?.status));

const matchesYear = (year: number, f: YearFilter) =>
  f === '2020s' ? year >= 2020 : f === '2010s' ? year < 2020 : year === Number(f);

/**
 * The library's WHERE + ORDER BY. Pure, so it is unit-tested and can later move to the API (review M6).
 */
export function applyFilters(games: Game[], library: Library, query: LibraryQuery): Game[] {
  const { category, collection, trackingStatus, filters } = query;
  const q = filters.search.toLowerCase().trim();
  const inCollection = collection
    ? (COLLECTION[collection]?.matches ?? ((g: Game) => hasGenre(g, collection)))
    : null;
  const { field, dir } = SORT[filters.sort];
  const sign = dir === 'asc' ? 1 : -1;

  return games
    .filter(
      (g) =>
        inCategory(category, library[g.id]) &&
        (!inCollection || inCollection(g, library[g.id])) &&
        (!trackingStatus || library[g.id]?.status === trackingStatus) &&
        (!filters.genre || hasGenre(g, filters.genre)) &&
        (!filters.year || matchesYear(g.releaseYear, filters.year)) &&
        (!filters.platform || g.format === filters.platform) &&
        (!q ||
          g.title.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.publisher.toLowerCase().includes(q) ||
          hasGenre(g, q))
    )
    .sort((a, b) => {
      if (field === 'title') return sign * a.title.localeCompare(b.title);
      return sign * ((sortValue(a, library[a.id], field) as number) - (sortValue(b, library[b.id], field) as number));
    });
}

/** Badge counts for the sidebar collections, using the same `matches` as the filter. */
export const countCollections = (games: Game[], library: Library): Record<string, number> =>
  Object.fromEntries(COLLECTIONS.map((c) => [c.id, games.filter((g) => c.matches(g, library[g.id])).length]));

/** Badge counts for the sidebar categories, using the same rule as the filter. */
export const countCategories = (games: Game[], library: Library): Record<FilterCategory, number> => ({
  all: games.length,
  'my-games': games.filter((g) => inCategory('my-games', library[g.id])).length,
  favorites: games.filter((g) => inCategory('favorites', library[g.id])).length,
});

/** Badge counts for the My Games status sub-list. Catalog games only, so they add up to the My Games badge. */
export function countStatuses(games: Game[], library: Library): Record<UserTrackingStatus, number> {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, 0])) as Record<UserTrackingStatus, number>;
  for (const g of games) {
    const status = library[g.id]?.status;
    if (status) counts[status]++;
  }
  return counts;
}

/** Distinct genres across the catalog, sorted, for the genre dropdown. */
export const genreOptions = (games: Game[]) => [...new Set(games.flatMap((g) => g.genres))].sort();

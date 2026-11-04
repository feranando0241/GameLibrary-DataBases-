import React, { useState, useEffect, useMemo } from 'react';
import {
  GameControllerIcon,
  ListIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import type { Game, FilterCategory, Library, UserGame, UserTrackingStatus } from '../shared/domain/game';
import { STATUS, STATUSES } from '../shared/domain/status';
import { getGames, getLibrary, newUserGame, saveUserGame } from '../shared/api/api';
import {
  COLLECTION,
  DEFAULT_FILTERS,
  FilterBar,
  GameGrid,
  GameListView,
  SORT,
  SORTS,
  Sidebar,
  applyFilters,
  countCategories,
  countCollections,
  countStatuses,
  genreOptions,
  type FilterBarState,
} from '../features/library';
import { MediaHero } from '../features/game-detail';
import { TrackingModal } from '../features/tracking';
import { TopBar } from './TopBar';
import { PixelWaves } from './PixelWaves';

/** Page heading for the current sidebar selection. */
function pageTitle(
  category: FilterCategory,
  collection: string | null,
  status: UserTrackingStatus | null
): string {
  if (collection) return COLLECTION[collection]?.label ?? collection;
  const statusLabel = status ? STATUS[status].label : null;
  if (category === 'my-games') return statusLabel ? `My Games — ${statusLabel}` : 'My Games';
  if (category === 'favorites') return 'Favorites';
  return statusLabel ?? 'All Games';
}

/**
 * Root component and the only stateful owner of the app's data.
 * - Loads the catalog and the user's library once from lib/api.ts and keeps them in state.
 * - Owns the view state (open game, tracking modal, grid/list) and the library query
 *   (sidebar selection + filter bar); the visible list is derived from both via lib/filters.ts.
 * - Every write goes through `persist`, so the API stays the single source of truth.
 * Child components are presentational: they get data via props and report actions via callbacks.
 */
export const App: React.FC = () => {
  // Data: everything comes from lib/api.ts
  const [games, setGames] = useState<Game[]>([]);
  const [library, setLibrary] = useState<Library>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getGames(), getLibrary()])
      .then(([g, l]) => {
        if (!active) return;
        setGames(g);
        setLibrary(l);
      })
      .catch(() => active && setLoadError('Could not load your library.'))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // View state
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [trackingTarget, setTrackingTarget] = useState<Game | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Library query: sidebar selection + filter bar
  const [filterState, setFilterState] = useState<FilterBarState>(DEFAULT_FILTERS);
  const [sidebarCategory, setSidebarCategory] = useState<FilterCategory>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTrackingFilter, setActiveTrackingFilter] = useState<UserTrackingStatus | null>(null);

  const showCategory = (cat: FilterCategory) => {
    setSidebarCategory(cat);
    setSelectedGenre(null);
    setActiveTrackingFilter(null);
  };

  // Global Keyboard Shortcuts (Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
      // The tracking <dialog> handles its own Escape (and blocks it while saving).
      if (e.key === 'Escape' && !trackingTarget) setSelectedGame(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackingTarget]);

  // Actions: send only the changed fields (the API merges them), then keep the row it returns
  const persist = async (gameId: string, changes: Partial<UserGame>) => {
    const saved = await saveUserGame(gameId, changes);
    setLibrary((prev) => ({ ...prev, [gameId]: saved }));
  };

  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    const isFavorite = !library[gameId]?.isFavorite;
    const setFavorite = (value: boolean) =>
      setLibrary((prev) => ({ ...prev, [gameId]: { ...(prev[gameId] ?? newUserGame(gameId)), isFavorite: value } }));
    // Optimistic, so a second click before the save resolves toggles from the new value.
    // ponytail: out-of-order responses are last-wins; add a per-game request id if that shows up.
    setFavorite(isFavorite);
    persist(gameId, { isFavorite }).catch(() => {
      setFavorite(!isFavorite);
      setNotice('Could not update favorites. Please try again.');
    });
  };

  // Derived data (all logic lives in lib/filters.ts)
  const filteredAndSortedGames = useMemo(
    () =>
      applyFilters(games, library, {
        category: sidebarCategory,
        collection: selectedGenre,
        trackingStatus: activeTrackingFilter,
        filters: filterState,
      }),
    [games, library, sidebarCategory, selectedGenre, activeTrackingFilter, filterState]
  );
  const availableGenres = useMemo(() => genreOptions(games), [games]);
  const genreCounts = useMemo(() => countCollections(games, library), [games, library]);
  const trackingStatusCounts = useMemo(() => countStatuses(games, library), [games, library]);
  const categoryCounts = useMemo(() => countCategories(games, library), [games, library]);
  const activeSort = SORT[filterState.sort];

  return (
    <div className="min-h-screen text-ink flex flex-col font-sans selection:bg-accent selection:text-canvas">
      {/* Decorative pixel ripples. No bg on this wrapper so the canvas shows through. */}
      <PixelWaves />
      {/* TopBar with Geekbond Branding and Search */}
      <TopBar
        searchQuery={filterState.search}
        setSearchQuery={(q) => setFilterState((prev) => ({ ...prev, search: q }))}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentCategory={sidebarCategory}
          onSelectCategory={showCategory}
          selectedGenre={selectedGenre}
          onSelectGenre={(genre) => {
            setSelectedGenre(genre);
            setActiveTrackingFilter(null);
          }}
          myGamesCount={categoryCounts['my-games']}
          favoritesCount={categoryCounts.favorites}
          totalCount={categoryCounts.all}
          genreCounts={genreCounts}
          activeTrackingFilter={activeTrackingFilter}
          onSelectTrackingFilter={setActiveTrackingFilter}
          trackingStatusCounts={trackingStatusCounts}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {notice && (
            <div role="alert" className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-rose-400/40 bg-surface px-4 py-3 text-sm text-ink">
              {notice}
              <button onClick={() => setNotice(null)} className="text-muted hover:text-ink">
                Dismiss
              </button>
            </div>
          )}

          {isLoading || loadError ? (
            <p role={loadError ? 'alert' : 'status'} className="py-20 text-center text-sm text-muted">
              {loadError ?? 'Loading your library…'}
            </p>
          ) : selectedGame ? (
            /* Comprehensive Media Hub */
            <MediaHero
              game={selectedGame}
              onBack={() => setSelectedGame(null)}
              onOpenTrack={() => setTrackingTarget(selectedGame)}
              userGame={library[selectedGame.id]}
            />
          ) : (
            <>
              {/* Page header: title + count, view toggle, then one compact filter row */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <h1 className="text-2xl font-black tracking-tight text-ink truncate">
                      {pageTitle(sidebarCategory, selectedGenre, activeTrackingFilter)}
                    </h1>
                    <span className="shrink-0 text-sm font-mono text-muted">
                      {filteredAndSortedGames.length} games
                    </span>
                  </div>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center bg-surface p-1 rounded-xl border border-line shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      aria-pressed={viewMode === 'grid'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-accent text-canvas' : 'text-muted hover:text-ink'
                      }`}
                    >
                      <SquaresFourIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                      aria-pressed={viewMode === 'list'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-accent text-canvas' : 'text-muted hover:text-ink'
                      }`}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile category switch (sidebar is hidden below md) */}
                <div className="md:hidden flex gap-2 overflow-x-auto">
                  {(
                    [
                      ['all', 'All Games'],
                      ['my-games', 'My Games'],
                      ['favorites', 'Favorites'],
                    ] as [FilterCategory, string][]
                  ).map(([cat, label]) => (
                    <button
                      key={cat}
                      aria-pressed={sidebarCategory === cat}
                      onClick={() => showCategory(cat)}
                      className={`shrink-0 text-sm px-3 py-1.5 rounded-xl ${
                        sidebarCategory === cat
                          ? 'bg-elevated text-accent font-semibold'
                          : 'text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <FilterBar
                  filters={filterState}
                  onChange={setFilterState}
                  availableGenres={availableGenres}
                  status={activeTrackingFilter}
                  onStatusChange={setActiveTrackingFilter}
                />
              </div>

              {/* Empty State */}
              {filteredAndSortedGames.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl bg-surface border border-line p-8">
                  <GameControllerIcon className="w-12 h-12 text-accent mb-3" />
                  <h3 className="text-base font-bold text-ink">
                    {sidebarCategory === 'my-games' ? 'No games tracked under this status' : 'No games match your filters'}
                  </h3>
                  <p className="text-sm text-muted mt-1 max-w-sm">
                    {sidebarCategory === 'my-games'
                      ? 'Use the + button on any game to start tracking it.'
                      : 'Nothing matches the current search and filters.'}
                  </p>
                  <button
                    onClick={() => {
                      setFilterState(DEFAULT_FILTERS);
                      showCategory('all');
                    }}
                    className="mt-4 text-sm px-4 py-2 rounded-xl font-semibold bg-accent text-canvas hover:bg-accent-hover"
                  >
                    Show All Games
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                /* Management Table View */
                <GameListView
                  games={filteredAndSortedGames}
                  library={library}
                  onSelectGame={setSelectedGame}
                  onToggleFavorite={handleToggleFavorite}
                  sortField={activeSort.field}
                  sortDirection={activeSort.dir}
                  onSortChange={(field) => {
                    const sort = SORTS.find((s) => s.field === field);
                    if (sort) setFilterState((prev) => ({ ...prev, sort: sort.id }));
                  }}
                />
              ) : sidebarCategory === 'my-games' && activeTrackingFilter === null ? (
                /* Divided Sub-lists by Status in My Games */
                <div className="space-y-10">
                  {STATUSES.map((sec) => {
                    const secGames = filteredAndSortedGames.filter(
                      (g) => library[g.id]?.status === sec.id
                    );
                    if (secGames.length === 0) return null;
                    return (
                      <section key={sec.id} className="space-y-4">
                        <div className="flex items-center gap-2.5">
                          <sec.icon weight="fill" className={`w-5 h-5 ${sec.text}`} aria-hidden />
                          <h2 className="text-lg font-semibold text-ink">{sec.label}</h2>
                          <span className="text-sm font-mono text-muted">{secGames.length}</span>
                        </div>
                        <GameGrid
                          games={secGames}
                          library={library}
                          onSelect={setSelectedGame}
                          onOpenTrack={setTrackingTarget}
                        />
                      </section>
                    );
                  })}
                </div>
              ) : (
                <GameGrid
                  games={filteredAndSortedGames}
                  library={library}
                  onSelect={setSelectedGame}
                  onOpenTrack={setTrackingTarget}
                />
              )}
            </>
          )}

          {/* User Tracking Drawer Modal */}
          {trackingTarget && (
            <TrackingModal
              game={trackingTarget}
              onClose={() => setTrackingTarget(null)}
              userGame={library[trackingTarget.id]}
              onSave={(changes) => persist(trackingTarget.id, changes)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

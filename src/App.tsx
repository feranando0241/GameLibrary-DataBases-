import React, { useState, useEffect, useMemo } from 'react';
import {
  GameControllerIcon,
  ListIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import type { Game, FilterCategory, SortField, UserTrackEntry, UserTrackingStatus } from './types/game';
import { STATUS, STATUSES } from './lib/status';
import { mockGames } from './data/mockGames';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/discover/FilterBar';
import { DEFAULT_FILTERS, type FilterBarState } from './lib/filters';
import { MediaCard } from './components/discover/MediaCard';
import { MediaHero } from './components/media-detail/MediaHero';
import { TrackingModal } from './components/tracker/TrackingModal';
import { GameListView } from './components/library/GameListView';
import { PixelWaves } from './components/layout/PixelWaves';

// FilterBar sort value ↔ list-view column
const SORT_FIELD: Record<string, SortField> = {
  SCORE_DESC: 'averageScore',
  HOURS_DESC: 'hoursPlayed',
  POPULARITY_DESC: 'popularity',
  TITLE_ASC: 'title',
  YEAR_DESC: 'releaseYear',
};

export const App: React.FC = () => {
  // Main Games State
  const [games, setGames] = useState<Game[]>(mockGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [trackingTarget, setTrackingTarget] = useState<Game | null>(null);
  const [userTracks, setUserTracks] = useState<Record<string, UserTrackEntry>>({
    'cyberpunk-2077': {
      gameId: 'cyberpunk-2077',
      status: 'CURRENT',
      score: 95,
      progress: 142,
      notes: 'Playing through the Phantom Liberty espionage expansion.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'elden-ring': {
      gameId: 'elden-ring',
      status: 'COMPLETED',
      score: 98,
      progress: 218,
      notes: 'Completed Shadow of the Erdtree DLC 100%.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'baldurs-gate-3': {
      gameId: 'baldurs-gate-3',
      status: 'CURRENT',
      score: 96,
      progress: 184,
      notes: 'Act III in the Lower City.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'witcher-3': {
      gameId: 'witcher-3',
      status: 'COMPLETED',
      score: 97,
      progress: 310,
      notes: 'Finished Blood and Wine & Hearts of Stone.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'hades-2': {
      gameId: 'hades-2',
      status: 'CURRENT',
      score: 92,
      progress: 65,
      notes: 'Deep runs toward the surface.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'dead-cells': {
      gameId: 'dead-cells',
      status: 'PAUSED',
      score: 92,
      progress: 93,
      notes: 'Stuck at 5 Boss Stem Cells.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'hollow-knight-silksong': {
      gameId: 'hollow-knight-silksong',
      status: 'PLANNING',
      score: 0,
      progress: 0,
      notes: 'Waiting for official release.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
    'starfield': {
      gameId: 'starfield',
      status: 'DROPPED',
      score: 68,
      progress: 45,
      notes: 'Explored 10 star systems, campaign became too repetitive.',
      updatedAt: '2026-11-03T12:00:00.000Z',
    },
  });

  // Filter Bar State (Pure Video Games)
  const [filterState, setFilterState] = useState<FilterBarState>(DEFAULT_FILTERS);

  // View & Category State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarCategory, setSidebarCategory] = useState<FilterCategory>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTrackingFilter, setActiveTrackingFilter] = useState<UserTrackingStatus | null>(null);

  // Global Keyboard Shortcuts (Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
      if (e.key === 'Escape') {
        if (trackingTarget) {
          setTrackingTarget(null);
        } else if (selectedGame) {
          setSelectedGame(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, trackingTarget]);

  // Actions
  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g))
    );
  };

  // Tracking Entry Handlers
  const handleSaveTrack = (entry: UserTrackEntry) => {
    setUserTracks((prev) => ({
      ...prev,
      [entry.gameId]: entry,
    }));
  };

  const handleDeleteTrack = (gameId: string) => {
    setUserTracks((prev) => {
      const copy = { ...prev };
      delete copy[gameId];
      return copy;
    });
  };

  // Filtered & Sorted Games List
  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    // Sidebar Category (All vs My Games vs Favorites)
    if (sidebarCategory === 'favorites') {
      result = result.filter((g) => g.isFavorite);
    } else if (sidebarCategory === 'my-games') {
      result = result.filter((g) => Boolean(userTracks[g.id]));
    }

    // Sidebar Collections / Genres
    if (selectedGenre) {
      if (selectedGenre === 'Backlog') {
        result = result.filter((g) => g.hoursPlayed === 0 || g.lastPlayed === 'Never');
      } else if (selectedGenre === 'Shooter') {
        result = result.filter((g) =>
          g.genres.some((genre) => {
            const low = genre.toLowerCase();
            return low.includes('shooter') || low.includes('fps');
          })
        );
      } else {
        result = result.filter((g) =>
          g.genres.some((genre) => genre.toLowerCase().includes(selectedGenre.toLowerCase()))
        );
      }
    }

    // Tracking Status quick filter
    if (activeTrackingFilter) {
      result = result.filter((g) => userTracks[g.id]?.status === activeTrackingFilter);
    }

    // FilterBar: Genre
    if (filterState.genre) {
      result = result.filter((g) =>
        g.genres.some((genre) => genre.toLowerCase().includes(filterState.genre.toLowerCase()))
      );
    }

    // FilterBar: Release Year
    if (filterState.year) {
      if (filterState.year === '2020s') {
        result = result.filter((g) => g.releaseYear >= 2020);
      } else if (filterState.year === '2010s') {
        result = result.filter((g) => g.releaseYear < 2020);
      } else {
        const yr = parseInt(filterState.year, 10);
        result = result.filter((g) => g.releaseYear === yr);
      }
    }

    // FilterBar: Platform
    if (filterState.platform) {
      result = result.filter((g) => g.format === filterState.platform);
    }

    // FilterBar: Install Status
    if (filterState.status) {
      if (filterState.status === 'INSTALLED') {
        result = result.filter((g) => g.isInstalled);
      } else if (filterState.status === 'CLOUD') {
        result = result.filter((g) => !g.isInstalled);
      }
    }

    // Search query
    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.publisher.toLowerCase().includes(q) ||
          g.genres.some((genre) => genre.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (filterState.sort === 'SCORE_DESC') {
        return b.averageScore - a.averageScore;
      }
      if (filterState.sort === 'HOURS_DESC') {
        return b.hoursPlayed - a.hoursPlayed;
      }
      if (filterState.sort === 'POPULARITY_DESC') {
        return b.popularity - a.popularity;
      }
      if (filterState.sort === 'STORAGE_DESC') {
        return b.storageGb - a.storageGb;
      }
      if (filterState.sort === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      if (filterState.sort === 'YEAR_DESC') {
        return b.releaseYear - a.releaseYear;
      }
      return b.averageScore - a.averageScore;
    });

    return result;
  }, [
    games,
    sidebarCategory,
    selectedGenre,
    activeTrackingFilter,
    filterState,
    userTracks,
  ]);

  // Available Genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => g.genres.forEach((genre) => set.add(genre)));
    return Array.from(set).sort();
  }, [games]);

  // Metrics
  const favoriteGames = useMemo(() => games.filter((g) => g.isFavorite), [games]);
  const myGamesCount = useMemo(
    () => games.filter((g) => Boolean(userTracks[g.id])).length,
    [games, userTracks]
  );

  // Tracking status counts for My Games sub-lists
  const trackingStatusCounts = useMemo(() => {
    const counts: Record<UserTrackingStatus, number> = {
      CURRENT: 0,
      COMPLETED: 0,
      PAUSED: 0,
      PLANNING: 0,
      DROPPED: 0,
    };
    Object.values(userTracks).forEach((track) => {
      if (counts[track.status] !== undefined) {
        counts[track.status]++;
      }
    });
    return counts;
  }, [userTracks]);

  // Genre Label Mapping
  const genreLabelMap: Record<string, string> = {
    Action: 'Action & Combat',
    RPG: 'RPGs & Fantasy',
    'Open World': 'Open World',
    Shooter: 'Shooters & FPS',
    'Souls-like': 'Souls-like & Tough',
    Roguelike: 'Roguelike & Dungeons',
    Strategy: 'Strategy & 4X',
    'Sci-Fi': 'Sci-Fi & Cyberpunk',
    Horror: 'Survival & Horror',
    Metroidvania: 'Metroidvania & Platformer',
    Racing: 'Racing & Driving',
    'Story Rich': 'Story Rich Narrative',
    Indie: 'Indie Highlights',
    Backlog: 'Backlog (Unplayed)',
  };

  // Genre counts for sidebar badges
  const genreCounts = useMemo(() => {
    const genresList = [
      'Action',
      'RPG',
      'Open World',
      'Shooter',
      'Souls-like',
      'Roguelike',
      'Strategy',
      'Sci-Fi',
      'Horror',
      'Metroidvania',
      'Racing',
      'Story Rich',
      'Indie',
      'Backlog',
    ];

    const counts: Record<string, number> = {};
    genresList.forEach((id) => {
      if (id === 'Backlog') {
        counts[id] = games.filter((g) => g.hoursPlayed === 0 || g.lastPlayed === 'Never').length;
      } else if (id === 'Shooter') {
        counts[id] = games.filter((g) =>
          g.genres.some((genre) => {
            const low = genre.toLowerCase();
            return low.includes('shooter') || low.includes('fps');
          })
        ).length;
      } else {
        counts[id] = games.filter((g) =>
          g.genres.some((genre) => genre.toLowerCase().includes(id.toLowerCase()))
        ).length;
      }
    });

    return counts;
  }, [games]);

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
          onSelectCategory={(cat) => {
            setSidebarCategory(cat);
            setSelectedGenre(null);
            setActiveTrackingFilter(null);
          }}
          selectedGenre={selectedGenre}
          onSelectGenre={(genre) => {
            setSelectedGenre(genre);
            setActiveTrackingFilter(null);
          }}
          myGamesCount={myGamesCount}
          favoritesCount={favoriteGames.length}
          totalCount={games.length}
          genreCounts={genreCounts}
          activeTrackingFilter={activeTrackingFilter}
          onSelectTrackingFilter={setActiveTrackingFilter}
          trackingStatusCounts={trackingStatusCounts}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {selectedGame ? (
            /* Comprehensive Media Hub */
            <MediaHero
              game={selectedGame}
              onBack={() => setSelectedGame(null)}
              onOpenTrack={() => setTrackingTarget(selectedGame)}
              currentTrack={userTracks[selectedGame.id]}
            />
          ) : (
            <>
              {/* Page header: title + count, view toggle, then one compact filter row */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <h1 className="text-2xl font-black tracking-tight text-ink truncate">
                      {selectedGenre
                        ? genreLabelMap[selectedGenre] || selectedGenre
                        : sidebarCategory === 'my-games'
                        ? activeTrackingFilter
                          ? `My Games — ${STATUS[activeTrackingFilter].label}`
                          : 'My Games'
                        : sidebarCategory === 'favorites'
                        ? 'Favorites'
                        : activeTrackingFilter
                        ? STATUS[activeTrackingFilter].label
                        : 'All Games'}
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
                      onClick={() => {
                        setSidebarCategory(cat);
                        setSelectedGenre(null);
                        setActiveTrackingFilter(null);
                      }}
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
                      setSidebarCategory('all');
                      setSelectedGenre(null);
                      setActiveTrackingFilter(null);
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
                  onSelectGame={setSelectedGame}
                  onToggleFavorite={handleToggleFavorite}
                  sortField={SORT_FIELD[filterState.sort] ?? 'averageScore'}
                  sortDirection={filterState.sort === 'TITLE_ASC' ? 'asc' : 'desc'}
                  onSortChange={(field) => {
                    const sort = Object.keys(SORT_FIELD).find((k) => SORT_FIELD[k] === field);
                    if (sort) setFilterState((prev) => ({ ...prev, sort }));
                  }}
                />
              ) : sidebarCategory === 'my-games' && activeTrackingFilter === null ? (
                /* Divided Sub-lists by Status in My Games */
                <div className="space-y-10">
                  {STATUSES.map((sec) => {
                    const secGames = filteredAndSortedGames.filter(
                      (g) => userTracks[g.id]?.status === sec.id
                    );
                    if (secGames.length === 0) return null;
                    return (
                      <section key={sec.id} className="space-y-4">
                        <div className="flex items-center gap-2.5">
                          <sec.icon weight="fill" className={`w-5 h-5 ${sec.text}`} aria-hidden />
                          <h2 className="text-lg font-semibold text-ink">{sec.label}</h2>
                          <span className="text-sm font-mono text-muted">{secGames.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
                          {secGames.map((game) => (
                            <MediaCard
                              key={game.id}
                              game={game}
                              onSelect={setSelectedGame}
                              onOpenTrack={() => setTrackingTarget(game)}
                              trackingStatus={userTracks[game.id]?.status}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* Standardized 2:3 Card Wall */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
                  {filteredAndSortedGames.map((game) => (
                    <MediaCard
                      key={game.id}
                      game={game}
                      onSelect={setSelectedGame}
                      onOpenTrack={() => setTrackingTarget(game)}
                      trackingStatus={userTracks[game.id]?.status}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* User Tracking Drawer Modal */}
          {trackingTarget && (
            <TrackingModal
              game={trackingTarget}
              onClose={() => setTrackingTarget(null)}
              currentEntry={userTracks[trackingTarget.id]}
              onSave={handleSaveTrack}
              onDelete={handleDeleteTrack}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  List as ListIcon,
  Gamepad2,
} from 'lucide-react';
import type { Game, FilterCategory, UserTrackEntry, UserTrackingStatus } from './types/game';
import { mockGames } from './data/mockGames';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/discover/FilterBar';
import type { FilterBarState } from './components/discover/FilterBar';
import { MediaCard } from './components/discover/MediaCard';
import { MediaHero } from './components/media-detail/MediaHero';
import { TrackingModal } from './components/tracker/TrackingModal';
import { GameListView } from './components/library/GameListView';

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
  const [filterState, setFilterState] = useState<FilterBarState>({
    search: '',
    genre: '',
    year: '',
    platform: '',
    status: '',
    sort: 'SCORE_DESC',
  });

  // View & Category State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarCategory, setSidebarCategory] = useState<FilterCategory>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTrackingFilter, setActiveTrackingFilter] = useState<UserTrackingStatus | null>(null);

  // Ensure dark theme is active
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('geekbond-theme', 'dark');
  }, []);

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

  // My Games sub-list sections definition
  const myGamesSections: { id: UserTrackingStatus; name: string; dotColor: string }[] = [
    { id: 'CURRENT', name: 'Currently Playing', dotColor: 'bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]' },
    { id: 'COMPLETED', name: 'Completed', dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' },
    { id: 'PAUSED', name: 'On Hold', dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
    { id: 'PLANNING', name: 'Plan to Play', dotColor: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' },
    { id: 'DROPPED', name: 'Dropped', dotColor: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]' },
  ];

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
    <div className="min-h-screen bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F1F5F9] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] flex flex-col font-sans transition-colors selection:bg-[#00FFD1] selection:text-[#0B141E]">
      {/* TopBar with Geekbond Branding and Search */}
      <TopBar
        searchQuery={filterState.search}
        setSearchQuery={(q) => setFilterState((prev) => ({ ...prev, search: q }))}
        totalGamesCount={games.length}
      />

      <div className="flex-1 flex overflow-hidden">
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
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
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
              {/* Multi-faceted Filter Bar */}
              <FilterBar
                filters={filterState}
                onChange={setFilterState}
                availableGenres={availableGenres}
              />

              {/* Viewport Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">
                      {selectedGenre
                        ? `${genreLabelMap[selectedGenre] || selectedGenre} Titles`
                        : sidebarCategory === 'my-games'
                        ? activeTrackingFilter
                          ? `My Games — ${
                              activeTrackingFilter === 'CURRENT'
                                ? 'Playing'
                                : activeTrackingFilter === 'COMPLETED'
                                ? 'Completed'
                                : activeTrackingFilter === 'PAUSED'
                                ? 'On Hold'
                                : activeTrackingFilter === 'PLANNING'
                                ? 'Planning'
                                : 'Dropped'
                            }`
                          : 'My Games Collection'
                        : sidebarCategory === 'favorites'
                        ? 'Favorite Titles'
                        : 'Game Library & Catalog'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#131F2E] dark:bg-[#131F2E] light:bg-white text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shadow-sm">
                      {filteredAndSortedGames.length} games
                    </span>
                  </div>

                  {/* Play Tracking Status Quick Filters */}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <button
                      onClick={() => setActiveTrackingFilter(null)}
                      className={`text-xs px-3 py-1 rounded-xl font-bold transition-all ${
                        activeTrackingFilter === null
                          ? 'bg-[#00FFD1] text-[#0B141E] shadow-[0_0_15px_rgba(0,255,209,0.35)]'
                          : 'bg-[#131F2E] dark:bg-[#131F2E] light:bg-white text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]'
                      }`}
                    >
                      All Games
                    </button>
                    {(['CURRENT', 'PLANNING', 'COMPLETED', 'PAUSED', 'DROPPED'] as UserTrackingStatus[]).map(
                      (st) => {
                        const count = Object.values(userTracks).filter((t) => t.status === st).length;
                        const labelMap: Record<UserTrackingStatus, string> = {
                          CURRENT: 'Playing',
                          PLANNING: 'Plan to Play',
                          COMPLETED: 'Completed',
                          PAUSED: 'On Hold',
                          DROPPED: 'Dropped',
                        };
                        return (
                          <button
                            key={st}
                            onClick={() =>
                              setActiveTrackingFilter((prev) => (prev === st ? null : st))
                            }
                            className={`text-xs px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                              activeTrackingFilter === st
                                ? 'bg-[#00FFD1] text-[#0B141E] font-bold shadow-[0_0_15px_rgba(0,255,209,0.35)]'
                                : 'bg-[#131F2E] dark:bg-[#131F2E] light:bg-white text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]'
                            }`}
                          >
                            <span>{labelMap[st]}</span>
                            <span className="font-mono text-[10px] opacity-75">({count})</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center bg-[#131F2E] dark:bg-[#131F2E] light:bg-white p-1 rounded-xl border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] self-start sm:self-auto shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#00FFD1] text-[#0B141E] shadow-[0_0_12px_rgba(0,255,209,0.4)]'
                        : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1]'
                    }`}
                    title="Grid View (Poster Wall)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#00FFD1] text-[#0B141E] shadow-[0_0_12px_rgba(0,255,209,0.4)]'
                        : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1]'
                    }`}
                    title="List View (Management Table)"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Empty State */}
              {filteredAndSortedGames.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] p-8 shadow-sm">
                  <Gamepad2 className="w-12 h-12 text-[#00FFD1] mb-3" />
                  <h3 className="text-base font-bold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">
                    {sidebarCategory === 'my-games' ? 'No games tracked under this status' : 'No games match your filters'}
                  </h3>
                  <p className="text-xs text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] mt-1 max-w-sm">
                    {sidebarCategory === 'my-games'
                      ? 'Click the (+) button on any game in the catalog to add it to your personal library and change its status!'
                      : 'Try clearing search criteria, selecting "All Genres", or resetting active filter chips.'}
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                /* Management Table View */
                <GameListView
                  games={filteredAndSortedGames}
                  onSelectGame={setSelectedGame}
                  onToggleFavorite={handleToggleFavorite}
                  sortField="title"
                  sortDirection="asc"
                  onSortChange={() => {}}
                />
              ) : sidebarCategory === 'my-games' && activeTrackingFilter === null ? (
                /* Divided Sub-lists by Status in My Games */
                <div className="space-y-10">
                  {myGamesSections.map((sec) => {
                    const secGames = filteredAndSortedGames.filter(
                      (g) => userTracks[g.id]?.status === sec.id
                    );
                    if (secGames.length === 0) return null;
                    return (
                      <section key={sec.id} className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#22354B]/60 dark:border-[#22354B]/60 light:border-[#CBD5E1]">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${sec.dotColor}`} />
                            <h2 className="text-lg font-black font-display tracking-wide uppercase text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">
                              {sec.name}
                            </h2>
                            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#131F2E] dark:bg-[#131F2E] light:bg-white text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] font-bold border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                              {secGames.length}
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveTrackingFilter(sec.id)}
                            className="text-xs font-semibold text-[#8BA0B2] hover:text-[#00FFD1] transition-colors"
                          >
                            Focus View →
                          </button>
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
              isOpen={Boolean(trackingTarget)}
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

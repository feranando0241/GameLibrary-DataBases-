import React, { useState } from 'react';
import {
  Layers,
  Heart,
  Gamepad2,
  FolderHeart,
  Flame,
  Sword,
  Globe,
  Crosshair,
  Skull,
  Repeat,
  Crown,
  Cpu,
  Ghost,
  Layers as LayersIcon,
  Car,
  BookOpen,
  Compass,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { FilterCategory, UserTrackingStatus } from '../../types/game';

interface SidebarProps {
  currentCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
  myGamesCount: number;
  favoritesCount: number;
  totalCount: number;
  genreCounts?: Record<string, number>;
  activeTrackingFilter?: UserTrackingStatus | null;
  onSelectTrackingFilter?: (status: UserTrackingStatus | null) => void;
  trackingStatusCounts?: Record<UserTrackingStatus, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  selectedGenre,
  onSelectGenre,
  myGamesCount,
  favoritesCount,
  totalCount,
  genreCounts,
  activeTrackingFilter,
  onSelectTrackingFilter,
  trackingStatusCounts,
}) => {
  const [isExtended, setIsExtended] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [isMyGamesOpen, setIsMyGamesOpen] = useState(true);

  const trackingStatuses: { id: UserTrackingStatus; name: string; dotColor: string }[] = [
    { id: 'CURRENT', name: 'Playing', dotColor: 'bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]' },
    { id: 'COMPLETED', name: 'Completed', dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' },
    { id: 'PAUSED', name: 'On Hold', dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
    { id: 'PLANNING', name: 'Planning', dotColor: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' },
    { id: 'DROPPED', name: 'Dropped', dotColor: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]' },
  ];

  const collections = [
    { id: 'Action', name: 'Action & Combat', icon: Flame },
    { id: 'RPG', name: 'RPGs & Fantasy', icon: Sword },
    { id: 'Open World', name: 'Open World', icon: Globe },
    { id: 'Shooter', name: 'Shooters & FPS', icon: Crosshair },
    { id: 'Souls-like', name: 'Souls-like & Tough', icon: Skull },
    { id: 'Roguelike', name: 'Roguelike & Dungeons', icon: Repeat },
    { id: 'Strategy', name: 'Strategy & 4X', icon: Crown },
    { id: 'Sci-Fi', name: 'Sci-Fi & Cyberpunk', icon: Cpu },
    { id: 'Horror', name: 'Survival & Horror', icon: Ghost },
    { id: 'Metroidvania', name: 'Metroidvania & Platformer', icon: LayersIcon },
    { id: 'Racing', name: 'Racing & Driving', icon: Car },
    { id: 'Story Rich', name: 'Story Rich Narrative', icon: BookOpen },
    { id: 'Indie', name: 'Indie Highlights', icon: Compass },
    { id: 'Backlog', name: 'Backlog (Unplayed)', icon: Clock },
  ];

  const INITIAL_VISIBLE_COUNT = 5;
  const isSelectedBeyondInitial =
    selectedGenre !== null &&
    collections.findIndex((c) => c.id === selectedGenre) >= INITIAL_VISIBLE_COUNT;

  // Auto-extend if selected genre is further down
  const showAll = isExtended || isSelectedBeyondInitial;
  const visibleCollections = showAll ? collections : collections.slice(0, INITIAL_VISIBLE_COUNT);

  const handleCategoryClick = (cat: FilterCategory) => {
    onSelectCategory(cat);
    onSelectGenre(null);
  };

  const handleCollectionClick = (genreId: string) => {
    if (selectedGenre === genreId) {
      onSelectGenre(null);
    } else {
      onSelectGenre(genreId);
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border-r border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] p-4 select-none transition-colors">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Main Library Navigation */}
        <div>
          <div className="text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider px-3 mb-2">
            Library
          </div>
          <nav className="space-y-1">
            {/* All Games */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentCategory === 'all' && selectedGenre === null
                  ? 'bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#E2E8F0] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#00FFD1]/40 shadow-[0_0_15px_rgba(0,255,209,0.2)] font-bold'
                  : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D]/70 dark:hover:bg-[#1A2A3D]/70 light:hover:bg-[#F1F5F9] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>All Games</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#475569]">
                {totalCount}
              </span>
            </button>

            {/* My Games with Sub-list */}
            <div>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    handleCategoryClick('my-games');
                    onSelectTrackingFilter?.(null);
                  }}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentCategory === 'my-games' && selectedGenre === null && !activeTrackingFilter
                      ? 'bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#E2E8F0] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#00FFD1]/40 shadow-[0_0_15px_rgba(0,255,209,0.2)] font-bold'
                      : currentCategory === 'my-games' && selectedGenre === null
                      ? 'text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] bg-[#1A2A3D]/40 font-bold'
                      : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D]/70 dark:hover:bg-[#1A2A3D]/70 light:hover:bg-[#F1F5F9] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-4 h-4 text-[#00FFD1]" />
                    <span>My Games</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#475569]">
                    {myGamesCount}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMyGamesOpen(!isMyGamesOpen);
                  }}
                  title={isMyGamesOpen ? 'Collapse My Games sub-list' : 'Expand My Games sub-list'}
                  className="p-2 ml-1 text-[#8BA0B2] hover:text-[#00FFD1] rounded-lg transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMyGamesOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              </div>

              {/* My Games Sub-list (Playing, Completed, On Hold, Planning, Dropped) */}
              {isMyGamesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] space-y-0.5 py-0.5">
                  {trackingStatuses.map((st) => {
                    const isSubActive =
                      currentCategory === 'my-games' &&
                      selectedGenre === null &&
                      activeTrackingFilter === st.id;
                    const count = trackingStatusCounts?.[st.id] ?? 0;
                    return (
                      <button
                        key={st.id}
                        onClick={() => {
                          onSelectCategory('my-games');
                          onSelectGenre(null);
                          onSelectTrackingFilter?.(activeTrackingFilter === st.id ? null : st.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#E2E8F0] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] font-bold border border-[#00FFD1]/30 shadow-sm'
                            : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${st.dotColor}`} />
                          <span className="truncate">{st.name}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                            isSubActive
                              ? 'bg-[#00FFD1]/20 text-[#00FFD1] font-bold'
                              : 'bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Favorites */}
            <button
              onClick={() => handleCategoryClick('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentCategory === 'favorites' && selectedGenre === null
                  ? 'bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#E2E8F0] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#00FFD1]/40 shadow-[0_0_15px_rgba(0,255,209,0.2)] font-bold'
                  : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D]/70 dark:hover:bg-[#1A2A3D]/70 light:hover:bg-[#F1F5F9] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Favorites</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#475569]">
                {favoritesCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Collections / Genres with Shrink & Extend Controls */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <button
              onClick={() => setIsSectionOpen(!isSectionOpen)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider hover:text-[#F1F5F9] transition-colors"
            >
              <FolderHeart className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span>Genres</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isSectionOpen ? '' : '-rotate-90'
                }`}
              />
            </button>

            {isSectionOpen && (
              <button
                onClick={() => setIsExtended(!isExtended)}
                title={showAll ? 'Shrink genre list' : 'Extend full genre list'}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#00FFD1] hover:bg-[#00FFD1]/20 transition-all font-semibold"
              >
                {showAll ? 'Shrink' : 'Extend'}
              </button>
            )}
          </div>

          {isSectionOpen && (
            <nav className="space-y-1">
              {visibleCollections.map((col) => {
                const Icon = col.icon;
                const isActive = selectedGenre === col.id;
                const count = genreCounts?.[col.id];
                return (
                  <button
                    key={col.id}
                    onClick={() => handleCollectionClick(col.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#E2E8F0] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#00FFD1]/40 font-bold shadow-sm'
                        : 'text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D]/50 dark:hover:bg-[#1A2A3D]/50 light:hover:bg-[#F1F5F9] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#00FFD1]' : 'text-[#8BA0B2]'}`} />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof count === 'number' && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-[#00FFD1]/20 text-[#00FFD1] font-bold'
                              : 'bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Bottom Extend / Shrink Toggle Button */}
              <button
                onClick={() => setIsExtended(!showAll)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 rounded-xl text-xs font-semibold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1] dark:hover:text-[#00FFD1] light:hover:text-[#00897B] hover:bg-[#1A2A3D]/40 dark:hover:bg-[#1A2A3D]/40 light:hover:bg-[#F1F5F9] transition-all"
              >
                {showAll ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show More ({collections.length - INITIAL_VISIBLE_COUNT} more)</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import {
  CaretDownIcon,
  CaretUpIcon,
  GameControllerIcon,
  HeartIcon,
  StackIcon,
} from '@phosphor-icons/react';
import type { FilterCategory, UserTrackingStatus } from '../../shared/domain/game';
import { STATUSES } from '../../shared/domain/status';
import { COLLECTIONS } from './collections';

interface SidebarProps {
  /** All Games / My Games / Favorites */
  currentCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  /** Selected collection id from lib/collections.ts (null = none); the prop name predates collections */
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
  /** Badge counts, computed in lib/filters.ts with the same rules as the list they label */
  myGamesCount: number;
  favoritesCount: number;
  totalCount: number;
  genreCounts?: Record<string, number>;
  /** Selected status in the My Games sub-list (null = all statuses) */
  activeTrackingFilter?: UserTrackingStatus | null;
  onSelectTrackingFilter?: (status: UserTrackingStatus | null) => void;
  trackingStatusCounts?: Record<UserTrackingStatus, number>;
}

/**
 * Left navigation (hidden below md; App shows a compact category switch there instead).
 * Three blocks: library categories, the My Games status sub-list, and the collections list.
 * Holds only UI state (which sections are open); the selection itself lives in App.
 */
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

  // Collections shown before "Show More"; the list auto-expands if the selected one is hidden.
  const INITIAL_VISIBLE_COUNT = 5;
  const isSelectedBeyondInitial =
    selectedGenre !== null &&
    COLLECTIONS.findIndex((c) => c.id === selectedGenre) >= INITIAL_VISIBLE_COUNT;

  const showAll = isExtended || isSelectedBeyondInitial;
  const visibleCollections = showAll ? COLLECTIONS : COLLECTIONS.slice(0, INITIAL_VISIBLE_COUNT);

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
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] bg-surface border-r border-line p-4 select-none">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Main Library Navigation */}
        <div>
          <div className="text-xs font-semibold text-muted px-3 mb-2">
            Library
          </div>
          <nav className="space-y-1">
            {/* All Games */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                currentCategory === 'all' && selectedGenre === null
                  ? 'bg-elevated text-accent font-semibold'
                  : 'text-muted hover:text-ink hover:bg-elevated/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <StackIcon weight={currentCategory === 'all' && selectedGenre === null ? 'fill' : 'regular'} className="w-4 h-4" />
                <span>All Games</span>
              </div>
              <span className="text-xs font-mono text-muted">
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
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    currentCategory === 'my-games' && selectedGenre === null && !activeTrackingFilter
                      ? 'bg-elevated text-accent font-semibold'
                      : currentCategory === 'my-games' && selectedGenre === null
                      ? 'text-accent bg-elevated/40 font-semibold'
                      : 'text-muted hover:text-ink hover:bg-elevated/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GameControllerIcon weight={currentCategory === 'my-games' && selectedGenre === null ? 'fill' : 'regular'} className="w-4 h-4" />
                    <span>My Games</span>
                  </div>
                  <span className="text-xs font-mono text-muted">
                    {myGamesCount}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMyGamesOpen(!isMyGamesOpen);
                  }}
                  aria-label="My Games statuses"
                  aria-expanded={isMyGamesOpen}
                  className="p-2 ml-1 text-muted hover:text-ink rounded-lg transition-colors"
                >
                  <CaretDownIcon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMyGamesOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              </div>

              {/* My Games Sub-list (Playing, Completed, On Hold, Planning, Dropped) */}
              {isMyGamesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-line space-y-0.5 py-0.5">
                  {STATUSES.map((st) => {
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                          isSubActive
                            ? 'bg-elevated text-accent font-semibold'
                            : 'text-muted hover:text-ink hover:bg-elevated/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <st.icon weight="fill" className={`w-3.5 h-3.5 shrink-0 ${st.text}`} aria-hidden />
                          <span className="truncate">{st.label}</span>
                        </div>
                        <span
                          className={`text-xs font-mono ${
                            isSubActive
                              ? 'text-accent'
                              : 'text-muted'
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                currentCategory === 'favorites' && selectedGenre === null
                  ? 'bg-elevated text-accent font-semibold'
                  : 'text-muted hover:text-ink hover:bg-elevated/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <HeartIcon weight={currentCategory === 'favorites' && selectedGenre === null ? 'fill' : 'regular'} className="w-4 h-4 text-rose-400" />
                <span>Favorites</span>
              </div>
              <span className="text-xs font-mono text-muted">
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
              aria-expanded={isSectionOpen}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              <span>Genres</span>
              <CaretDownIcon
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isSectionOpen ? '' : '-rotate-90'
                }`}
              />
            </button>
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'bg-elevated text-accent font-semibold'
                        : 'text-muted hover:text-ink hover:bg-elevated/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon weight={isActive ? 'fill' : 'regular'} className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`} />
                      <span className="truncate">{col.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof count === 'number' && (
                        <span
                          className={`text-xs font-mono ${
                            isActive
                              ? 'text-accent'
                              : 'text-muted'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Bottom Extend / Shrink Toggle Button */}
              <button
                onClick={() => setIsExtended(!showAll)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 rounded-xl text-xs text-muted hover:text-ink hover:bg-elevated/40 transition-all"
              >
                {showAll ? (
                  <>
                    <span>Show Less</span>
                    <CaretUpIcon className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show More ({COLLECTIONS.length - INITIAL_VISIBLE_COUNT} more)</span>
                    <CaretDownIcon className="w-3.5 h-3.5" />
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

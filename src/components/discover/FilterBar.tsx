import React from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { DEFAULT_FILTERS, type FilterBarState } from '../../lib/filters';
import { STATUSES } from '../../lib/status';
import type { UserTrackingStatus } from '../../types/game';

interface FilterBarProps {
  filters: FilterBarState;
  onChange: (filters: FilterBarState) => void;
  availableGenres: string[];
  /** Status filter; only shown on small screens, where the sidebar (which owns it) is hidden */
  status: UserTrackingStatus | null;
  onStatusChange: (status: UserTrackingStatus | null) => void;
}

const select =
  'shrink-0 bg-surface text-ink text-sm rounded-xl px-3 py-2 border border-line hover:border-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer';

/** One compact row of filters under the page title. Each select names itself via its first option. */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  availableGenres,
  status,
  onStatusChange,
}) => {
  const updateField = (field: keyof FilterBarState, value: string) =>
    onChange({ ...filters, [field]: value });

  const hasActiveFilters =
    filters.search || filters.genre || filters.year || filters.platform || filters.status;

  return (
    // One scrollable row on phones, wraps from sm up
    <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
      <select
        aria-label="Play status"
        value={status ?? ''}
        onChange={(e) => onStatusChange((e.target.value || null) as UserTrackingStatus | null)}
        className={`${select} md:hidden`}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Genre"
        value={filters.genre}
        onChange={(e) => updateField('genre', e.target.value)}
        className={select}
      >
        <option value="">All Genres</option>
        {availableGenres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select
        aria-label="Release year"
        value={filters.year}
        onChange={(e) => updateField('year', e.target.value)}
        className={select}
      >
        <option value="">Any Year</option>
        <option value="2025">2025 (Upcoming)</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2020s">2020s</option>
        <option value="2010s">2010s & Older</option>
      </select>

      <select
        aria-label="Platform"
        value={filters.platform}
        onChange={(e) => updateField('platform', e.target.value)}
        className={select}
      >
        <option value="">All Platforms</option>
        <option value="PC">PC</option>
        <option value="PlayStation 5">PlayStation 5</option>
        <option value="Xbox Series X">Xbox Series X</option>
        <option value="Nintendo Switch">Nintendo Switch</option>
        <option value="Steam Deck">Steam Deck</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
          className="shrink-0 flex items-center gap-1.5 px-2 py-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowCounterClockwiseIcon className="w-4 h-4" /> Clear Filters
        </button>
      )}

      <select
        aria-label="Sort by"
        value={filters.sort}
        onChange={(e) => updateField('sort', e.target.value)}
        className={`${select} sm:ml-auto`}
      >
        <option value="SCORE_DESC">Top Rated</option>
        <option value="HOURS_DESC">Most Played</option>
        <option value="POPULARITY_DESC">Most Popular</option>
        <option value="TITLE_ASC">Title A–Z</option>
        <option value="YEAR_DESC">Newest</option>
      </select>
    </div>
  );
};

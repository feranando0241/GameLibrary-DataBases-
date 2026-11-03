import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export interface FilterBarState {
  search: string;
  genre: string;
  year: string;
  platform: string;
  status: string;
  sort: string;
}

interface FilterBarProps {
  filters: FilterBarState;
  onChange: (filters: FilterBarState) => void;
  availableGenres: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  availableGenres,
}) => {
  const updateField = (field: keyof FilterBarState, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onChange({
      search: '',
      genre: '',
      year: '',
      platform: '',
      status: '',
      sort: 'SCORE_DESC',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.genre ||
    filters.year ||
    filters.platform ||
    filters.status ||
    filters.sort !== 'SCORE_DESC';

  return (
    <div className="w-full bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] rounded-2xl p-4 md:p-5 shadow-xl mb-6 transition-colors">
      {/* Top Search Bar */}
      <div className="relative w-full pb-4 border-b border-[#22354B]/60 dark:border-[#22354B]/60 light:border-[#E2E8F0]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]" />
        <input
          type="text"
          placeholder="Search games by title, developer, publisher, or genre tags..."
          value={filters.search}
          onChange={(e) => updateField('search', e.target.value)}
          className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F1F5F9] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] placeholder-[#8BA0B2] dark:placeholder-[#8BA0B2] light:placeholder-[#64748B] text-sm rounded-xl pl-10 pr-10 py-2.5 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] transition-all outline-none focus:ring-2 focus:ring-[#00FFD1] focus:border-transparent"
        />
        {filters.search && (
          <button
            onClick={() => updateField('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8BA0B2] hover:text-[#00FFD1]"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selectors Layer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        {/* Genre Selector */}
        <div>
          <label className="block text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider mb-1.5">
            Genre
          </label>
          <select
            value={filters.genre}
            onChange={(e) => updateField('genre', e.target.value)}
            className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F8FAFC] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] text-xs font-medium rounded-xl px-3 py-2 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#00FFD1] cursor-pointer"
          >
            <option value="">All Genres</option>
            {availableGenres.map((g) => (
              <option key={g} value={g} className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Year / Era Selector */}
        <div>
          <label className="block text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider mb-1.5">
            Release Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => updateField('year', e.target.value)}
            className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F8FAFC] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] text-xs font-medium rounded-xl px-3 py-2 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#00FFD1] cursor-pointer"
          >
            <option value="">Any Year</option>
            <option value="2025" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">2025 (Upcoming)</option>
            <option value="2024" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">2024</option>
            <option value="2023" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">2023</option>
            <option value="2020s" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">2020s</option>
            <option value="2010s" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">2010s & Older</option>
          </select>
        </div>

        {/* Platform Selector */}
        <div>
          <label className="block text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider mb-1.5">
            Platform
          </label>
          <select
            value={filters.platform}
            onChange={(e) => updateField('platform', e.target.value)}
            className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F8FAFC] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] text-xs font-medium rounded-xl px-3 py-2 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#00FFD1] cursor-pointer"
          >
            <option value="">All Platforms</option>
            <option value="PC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">PC</option>
            <option value="PlayStation 5" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">PlayStation 5</option>
            <option value="Xbox Series X" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Xbox Series X</option>
            <option value="Nintendo Switch" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Nintendo Switch</option>
            <option value="Steam Deck" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Steam Deck</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div>
          <label className="block text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider mb-1.5">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => updateField('sort', e.target.value)}
            className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F8FAFC] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] text-xs font-semibold rounded-xl px-3 py-2 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#00FFD1] cursor-pointer"
          >
            <option value="SCORE_DESC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Top Rated (Score)</option>
            <option value="HOURS_DESC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Hours Played</option>
            <option value="POPULARITY_DESC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Most Popular</option>
            <option value="TITLE_ASC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Title (A-Z)</option>
            <option value="YEAR_DESC" className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white">Release Date</option>
          </select>
        </div>
      </div>

      {/* Clear Active Filters Pill */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-[#22354B]/50 dark:border-[#22354B]/50 light:border-[#E2E8F0] flex items-center justify-between text-xs">
          <span className="text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]">Active game filters applied</span>
          <button
            onClick={handleReset}
            className="text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] font-bold hover:underline flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  Heart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { Game, SortField, SortDirection } from '../../types/game';
import { Button } from '../ui/Button';

interface GameListViewProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const GameListView: React.FC<GameListViewProps> = ({
  games,
  onSelectGame,
  onToggleFavorite,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#00FFD1] ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#00FFD1] ml-1" />
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shadow-xl transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">
          {/* Table Header */}
          <thead className="bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#F8FAFC] text-[11px] font-bold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] uppercase tracking-wider border-b border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-12 text-center">Fav</th>
              <th
                onClick={() => onSortChange('title')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#00FFD1] transition-colors"
              >
                <div className="flex items-center">
                  <span>Game & Publisher</span>
                  {renderSortIndicator('title')}
                </div>
              </th>
              <th className="py-3.5 px-4">Score</th>
              <th className="py-3.5 px-4">Platform</th>
              <th
                onClick={() => onSortChange('hoursPlayed')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#00FFD1] transition-colors text-right"
              >
                <div className="flex items-center justify-end">
                  <span>Hours Logged</span>
                  {renderSortIndicator('hoursPlayed')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('popularity')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#00FFD1] transition-colors text-right"
              >
                <div className="flex items-center justify-end">
                  <span>Popularity</span>
                  {renderSortIndicator('popularity')}
                </div>
              </th>
              <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#22354B]/60 dark:divide-[#22354B]/60 light:divide-[#E2E8F0] text-xs">
            {games.map((game) => (
              <tr
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="group hover:bg-[#1A2A3D]/70 dark:hover:bg-[#1A2A3D]/70 light:hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                {/* Favorite Toggle */}
                <td
                  className="py-3 pl-4 pr-2 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => onToggleFavorite(e, game.id)}
                    className="p-1 rounded-md text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#94A3B8] hover:text-rose-400 transition-colors outline-none focus:ring-2 focus:ring-[#00FFD1]"
                    title="Toggle Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        game.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Game Title, Dev, and Thumbnail */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-10 h-14 object-cover rounded-xl border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] group-hover:text-[#00FFD1] dark:group-hover:text-[#00FFD1] light:group-hover:text-[#00897B] transition-colors truncate max-w-xs md:max-w-md">
                        {game.title}
                      </div>
                      <div className="text-[11px] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] truncate">
                        {game.developer} • <span className="font-mono">{game.releaseYear}</span> • {game.format}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-xs text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] px-2 py-0.5 rounded-md bg-[#00FFD1]/10 border border-[#00FFD1]/30">
                    ★ {game.averageScore}%
                  </span>
                </td>

                {/* Platform Format */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#F1F5F9] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                    {game.format}
                  </span>
                </td>

                {/* Hours Logged */}
                <td className="py-3 px-4 text-right font-mono text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">
                  {game.hoursPlayed > 0 ? (
                    <span className="font-bold text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B]">
                      {game.hoursPlayed.toFixed(1)} hrs
                    </span>
                  ) : (
                    <span className="text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#94A3B8]">--</span>
                  )}
                </td>

                {/* Popularity */}
                <td className="py-3 px-4 text-right font-mono text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] whitespace-nowrap">
                  <span className="text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] font-medium">
                    #{game.popularity.toLocaleString()}
                  </span>
                </td>

                {/* Actions */}
                <td
                  className="py-3 pr-4 pl-2 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSelectGame(game)}
                    >
                      View Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

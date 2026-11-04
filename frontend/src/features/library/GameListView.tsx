import React from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
  HeartIcon,
} from '@phosphor-icons/react';
import type { Game, Library, SortField, SortDirection } from '../../types/game';
import { Button } from '../ui/Button';

interface GameListViewProps {
  games: Game[];
  library: Library;
  onSelectGame: (game: Game) => void;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
  /** Active sort, shown as an arrow on its column header */
  sortField: SortField;
  sortDirection: SortDirection;
  /** Called when a sortable header is clicked; App maps it to a SORTS entry */
  onSortChange: (field: SortField) => void;
}

/**
 * Table view of the library (the alternative to GameGrid): one row per game with favorite toggle,
 * score, platform, hours and popularity. Sorting is not done here; headers only report clicks.
 */
export const GameListView: React.FC<GameListViewProps> = ({
  games,
  library,
  onSelectGame,
  onToggleFavorite,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowsDownUpIcon className="w-3.5 h-3.5 opacity-40 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="w-3.5 h-3.5 text-accent ml-1" />
    ) : (
      <ArrowDownIcon className="w-3.5 h-3.5 text-accent ml-1" />
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface border border-line shadow-xl transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-ink">
          {/* Table Header */}
          <thead className="bg-elevated text-xs font-semibold text-muted border-b border-line">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-12 text-center">Fav</th>
              <th
                className="py-3.5 px-4"
                aria-sort={sortField === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button type="button" onClick={() => onSortChange('title')} className="flex items-center hover:text-ink transition-colors">
                  <span>Game & Publisher</span>
                  {renderSortIndicator('title')}
                </button>
              </th>
              <th className="py-3.5 px-4">Score</th>
              <th className="py-3.5 px-4">Platform</th>
              <th
                className="py-3.5 px-4 text-right"
                aria-sort={sortField === 'hoursPlayed' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button type="button" onClick={() => onSortChange('hoursPlayed')} className="flex items-center justify-end hover:text-ink transition-colors">
                  <span>Hours Logged</span>
                  {renderSortIndicator('hoursPlayed')}
                </button>
              </th>
              <th
                className="py-3.5 px-4 text-right"
                aria-sort={sortField === 'popularity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button type="button" onClick={() => onSortChange('popularity')} className="flex items-center justify-end hover:text-ink transition-colors">
                  <span>Popularity</span>
                  {renderSortIndicator('popularity')}
                </button>
              </th>
              <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-line/60 text-xs">
            {games.map((game) => {
              const isFavorite = Boolean(library[game.id]?.isFavorite);
              const hours = library[game.id]?.hoursPlayed ?? 0;
              return (
              <tr
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="group hover:bg-elevated/70 transition-colors cursor-pointer"
              >
                {/* Favorite Toggle */}
                <td
                  className="py-3 pl-4 pr-2 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => onToggleFavorite(e, game.id)}
                    className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors outline-none focus:ring-2 focus:ring-accent"
                    aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
                    aria-pressed={isFavorite}
                  >
                    <HeartIcon
                      weight={isFavorite ? 'fill' : 'regular'}
                      className={`w-4 h-4 ${isFavorite ? 'text-rose-500' : ''}`}
                    />
                  </button>
                </td>

                {/* Game Title, Dev, and Thumbnail */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-10 h-14 object-cover rounded-xl border border-line shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate max-w-xs md:max-w-md">
                        {game.title}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {game.developer} • <span className="font-mono">{game.releaseYear}</span> • {game.format}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-xs text-ink">
                    ★ {game.averageScore}%
                  </span>
                </td>

                {/* Platform Format */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-elevated text-muted border border-line">
                    {game.format}
                  </span>
                </td>

                {/* Hours Logged */}
                <td className="py-3 px-4 text-right font-mono text-ink">
                  {hours > 0 ? (
                    <span className="font-bold text-ink">
                      {hours.toFixed(1)} hrs
                    </span>
                  ) : (
                    <span className="text-muted">--</span>
                  )}
                </td>

                {/* Popularity */}
                <td className="py-3 px-4 text-right font-mono text-muted whitespace-nowrap">
                  <span className="text-ink font-medium">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

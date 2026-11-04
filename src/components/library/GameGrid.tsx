import React from 'react';
import type { Game, Library } from '../../types/game';
import { MediaCard } from '../discover/MediaCard';

interface GameGridProps {
  games: Game[];
  library: Library;
  onSelect: (game: Game) => void;
  onOpenTrack: (game: Game) => void;
}

/**
 * Responsive wall of 2:3 MediaCards (2 columns on phones up to 6 on wide screens).
 * Looks up each game's row in `library` so cards stay presentational.
 */
export const GameGrid: React.FC<GameGridProps> = ({ games, library, onSelect, onOpenTrack }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
    {games.map((game) => (
      <MediaCard
        key={game.id}
        game={game}
        onSelect={onSelect}
        onOpenTrack={() => onOpenTrack(game)}
        userGame={library[game.id]}
      />
    ))}
  </div>
);

import React from 'react';
import {
  CheckIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import type { Game, UserGame } from '../../shared/domain/game';
import { STATUS } from '../../shared/domain/status';

interface MediaCardProps {
  game: Game;
  /** Opens the game's detail page (MediaHero) */
  onSelect: (game: Game) => void;
  /** Opens the tracking modal; the quick-track button is hidden when omitted */
  onOpenTrack?: (e: React.MouseEvent, game: Game) => void;
  /** The current user's row for this game, if any */
  userGame?: UserGame;
}

/**
 * One poster card in the grid: cover, title, score, tracking status and hours played.
 * Catalog data comes from `game`; everything personal comes from `userGame`.
 */
export const MediaCard: React.FC<MediaCardProps> = ({
  game,
  onSelect,
  onOpenTrack,
  userGame,
}) => {
  const status = userGame?.status ? STATUS[userGame.status] : undefined;
  const hours = userGame?.hoursPlayed ?? 0;

  return (
    <div className="group relative flex flex-col motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1">
      {/* 2:3 Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface border border-line group-hover:border-accent/60 transition-colors">
        <img
          src={game.coverUrl}
          alt=""
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-transparent to-black/30" />

        <span className="absolute top-2.5 right-2.5 rounded-lg bg-canvas/80 px-2 py-0.5 text-xs font-mono font-bold text-ink">
          {game.averageScore}%
        </span>

        {/* Tracking status: icon + label, readable without color */}
        {status && (
          <span
            className={`absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${status.pill}`}
          >
            <status.icon weight="fill" className="w-3 h-3" aria-hidden />
            {/* Icon-only on narrow phone cards so it doesn't cover the score */}
            <span className="sr-only sm:not-sr-only">{status.label}</span>
          </span>
        )}

        {/* Quick track: hover, keyboard focus, and always on touch screens. z-10 sits above the card's stretched button */}
        {onOpenTrack && (
          <button
            type="button"
            onClick={(e) => onOpenTrack(e, game)}
            aria-label={status ? `Edit tracking for ${game.title}` : `Track ${game.title}`}
            className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-accent text-canvas flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
          >
            {status ? <CheckIcon weight="bold" className="w-4 h-4" /> : <PlusIcon weight="bold" className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Title is the card's real button; ::after stretches its hit area over the whole card */}
      <button
        type="button"
        onClick={() => onSelect(game)}
        className="mt-2.5 text-left text-sm font-semibold text-ink leading-snug line-clamp-1 focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-accent focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-canvas"
      >
        {game.title}
      </button>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span className="truncate max-w-[130px]">{game.developer}</span>
        <span className="font-mono">
          {hours ? `${hours.toFixed(1)}h` : game.releaseYear}
        </span>
      </div>
    </div>
  );
};

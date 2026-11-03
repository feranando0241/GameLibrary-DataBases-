import React from 'react';
import { Plus, Check } from 'lucide-react';
import type { Game, UserTrackingStatus } from '../../types/game';

interface MediaCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onOpenTrack?: (e: React.MouseEvent, game: Game) => void;
  trackingStatus?: UserTrackingStatus;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  game,
  onSelect,
  onOpenTrack,
  trackingStatus,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#00FFD1] border-[#00FFD1]/40 bg-[#00FFD1]/10';
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getTrackingBadge = (status: UserTrackingStatus) => {
    switch (status) {
      case 'CURRENT':
        return { label: 'Playing', bg: 'bg-[#00FFD1] text-[#0B141E]' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-500 text-black' };
      case 'PLANNING':
        return { label: 'Planning', bg: 'bg-indigo-500 text-white' };
      case 'PAUSED':
        return { label: 'On Hold', bg: 'bg-amber-500 text-black' };
      case 'DROPPED':
        return { label: 'Dropped', bg: 'bg-rose-500 text-white' };
    }
  };

  return (
    <div
      onClick={() => onSelect(game)}
      className="group flex flex-col cursor-pointer transition-transform duration-200 hover:-translate-y-1"
    >
      {/* 2:3 Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-[#E2E8F0] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shadow-md group-hover:border-[#00FFD1] group-hover:shadow-[0_10px_25px_rgba(0,255,209,0.3)] transition-all duration-300">
        <img
          src={game.coverUrl}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B141E]/95 dark:from-[#0B141E]/95 light:from-black/70 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Score Pill in Top Right */}
        <div
          className={`absolute top-2.5 right-2.5 rounded-lg backdrop-blur-md px-2 py-0.5 text-xs font-mono font-bold border shadow-sm ${getScoreColor(
            game.averageScore
          )}`}
        >
          {game.averageScore}%
        </div>

        {/* User Tracking Status Badge (if tracked) */}
        {trackingStatus && (
          <div
            className={`absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-md uppercase tracking-wider ${
              getTrackingBadge(trackingStatus).bg
            }`}
          >
            {getTrackingBadge(trackingStatus).label}
          </div>
        )}

        {/* Quick Track (+) Button on Hover */}
        {onOpenTrack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTrack(e, game);
            }}
            title="Track Game"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#00FFD1] text-[#0B141E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,209,0.7)] hover:scale-110 active:scale-95 z-20 font-bold"
          >
            {trackingStatus ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
          </button>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="mt-2.5 flex flex-col">
        <h4 className="line-clamp-1 text-sm font-bold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] group-hover:text-[#00FFD1] dark:group-hover:text-[#00FFD1] light:group-hover:text-[#00897B] transition-colors leading-snug">
          {game.title}
        </h4>
        <div className="mt-1 flex items-center justify-between text-xs text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]">
          <span className="truncate max-w-[130px]">{game.developer}</span>
          <span className="font-mono">{game.hoursPlayed ? `${game.hoursPlayed.toFixed(1)}h` : `${game.releaseYear}`}</span>
        </div>
      </div>
    </div>
  );
};

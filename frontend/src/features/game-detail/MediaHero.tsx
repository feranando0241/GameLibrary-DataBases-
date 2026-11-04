import React from 'react';
import {
  ArrowLeftIcon,
  BookmarkSimpleIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  TrendUpIcon,
  TrophyIcon,
} from '@phosphor-icons/react';
import type { Game, UserGame } from '../../shared/domain/game';
import { STATUS } from '../../shared/domain/status';
import { Button } from '../../shared/ui/Button';

interface MediaHeroProps {
  game: Game;
  /** Returns to the library view */
  onBack: () => void;
  /** Opens the tracking modal for this game */
  onOpenTrack: () => void;
  /** The current user's row for this game, if any */
  userGame?: UserGame;
}

/**
 * Detail page for one game: banner, poster, quick stats (score, hours, achievements) and synopsis.
 * Replaces the library view while a game is selected; Escape or the back button closes it.
 */
export const MediaHero: React.FC<MediaHeroProps> = ({
  game,
  onBack,
  onOpenTrack,
  userGame,
}) => {
  const status = userGame?.status;
  const unlocked = userGame?.achievementsUnlocked ?? 0;
  const achievementPercentage = Math.round((unlocked / Math.max(1, game.achievementsTotal)) * 100);

  return (
    <div className="w-full min-h-full pb-16">
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          className="bg-surface border-line text-ink hover:border-accent"
        >
          Back to Game Library
        </Button>
      </div>

      {/* Panoramic Header Banner */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-surface border border-line shadow-2xl">
        <img
          src={game.bannerUrl}
          alt={game.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/90 via-transparent to-transparent" />
      </div>

      {/* Overlapping Content Hub */}
      <div className="relative -mt-20 sm:-mt-28 md:-mt-36 px-4 md:px-8 z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Overlapping 2:3 Poster Card */}
          <div className="w-48 sm:w-56 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border-2 border-line shadow-2xl bg-surface relative">
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-canvas/90 backdrop-blur-md px-2 py-1 rounded-xl font-bold font-mono text-xs text-ink border border-line">
                ★ {game.averageScore}%
              </div>
            </div>

            {/* Quick Actions Under Poster */}
            <div className="mt-4 space-y-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={onOpenTrack}
                leftIcon={status ? <CheckIcon className="w-4 h-4 text-canvas" /> : <BookmarkSimpleIcon className="w-4 h-4 text-canvas" />}
                className="w-full"
              >
                {status ? `${STATUS[status].label} · Edit` : 'Start Tracking'}
              </Button>
            </div>
          </div>

          {/* Right Column: Title, Quick Stats, Synopsis */}
          <div className="flex-1 min-w-0 pt-2 md:pt-14">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface text-ink border border-line">
                  {game.format}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-muted bg-surface border border-line">
                  {game.releaseYear}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
                {game.title}
              </h1>
              <p className="text-sm text-muted font-medium">
                Developed by <span className="text-ink font-semibold">{game.developer}</span> • Published by {game.publisher}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-surface border border-line">
                <span className="text-xs text-muted flex items-center gap-1">
                  <StarIcon className="w-3.5 h-3.5 text-muted" /> Score Rating
                </span>
                <span className="text-lg font-bold font-mono text-ink mt-1 block">
                  {game.averageScore}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-line">
                <span className="text-xs text-muted flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" /> Hours Played
                </span>
                <span className="text-lg font-bold font-mono text-ink mt-1 block">
                  {(userGame?.hoursPlayed ?? 0).toFixed(1)} hrs
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-line">
                <span className="text-xs text-muted flex items-center gap-1">
                  <TrendUpIcon className="w-3.5 h-3.5" /> Popularity
                </span>
                <span className="text-lg font-bold font-mono text-ink mt-1 block">
                  #{game.popularity.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-line">
                <span className="text-xs text-muted flex items-center gap-1">
                  <TrophyIcon className="w-3.5 h-3.5 text-muted" /> Achievements
                </span>
                <span className="text-lg font-bold font-mono text-ink mt-1 block">
                  {unlocked}/{game.achievementsTotal} ({achievementPercentage}%)
                </span>
              </div>
            </div>

            {/* Synopsis & Genre Pills */}
            <div className="p-6 rounded-2xl bg-surface border border-line space-y-3">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                About the Game
              </h3>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {game.summary}
              </p>

              <div className="pt-3 border-t border-line/60 flex flex-wrap gap-2">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-xl bg-canvas text-xs font-semibold text-muted border border-line"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

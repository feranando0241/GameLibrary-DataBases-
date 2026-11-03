import React from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  BookmarkPlus,
  Check,
  Award,
} from 'lucide-react';
import type { Game, UserTrackEntry } from '../../types/game';
import { Button } from '../ui/Button';

interface MediaHeroProps {
  game: Game;
  onBack: () => void;
  onOpenTrack: () => void;
  currentTrack?: UserTrackEntry;
}

export const MediaHero: React.FC<MediaHeroProps> = ({
  game,
  onBack,
  onOpenTrack,
  currentTrack,
}) => {
  const achievementPercentage = Math.round(
    (game.achievements.unlocked / Math.max(1, game.achievements.total)) * 100
  );

  return (
    <div className="w-full min-h-full pb-16 animate-in fade-in duration-300">
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-[#00FFD1]" />}
          className="bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] hover:border-[#00FFD1]"
        >
          Back to Game Library
        </Button>
      </div>

      {/* Panoramic Header Banner */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shadow-2xl">
        <img
          src={game.bannerUrl}
          alt={game.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B141E] dark:from-[#0B141E] light:from-[#F1F5F9] via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/90 dark:from-[#0B141E]/90 light:from-[#F1F5F9]/80 via-transparent to-transparent" />
      </div>

      {/* Overlapping Content Hub */}
      <div className="relative -mt-20 sm:-mt-28 md:-mt-36 px-4 md:px-8 z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Overlapping 2:3 Poster Card */}
          <div className="w-48 sm:w-56 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border-2 border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] shadow-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white relative">
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-[#0B141E]/90 backdrop-blur-md px-2 py-1 rounded-xl font-bold font-mono text-xs text-[#00FFD1] border border-[#00FFD1]/40 shadow-lg">
                ★ {game.averageScore}%
              </div>
            </div>

            {/* Quick Actions Under Poster */}
            <div className="mt-4 space-y-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={onOpenTrack}
                leftIcon={currentTrack ? <Check className="w-4 h-4 text-[#0B141E]" /> : <BookmarkPlus className="w-4 h-4 text-[#0B141E]" />}
                className="w-full bg-[#00FFD1] text-[#0B141E] hover:bg-[#00E5BC] shadow-[0_0_20px_rgba(0,255,209,0.4)] font-bold text-xs uppercase tracking-wider"
              >
                {currentTrack ? `Tracked (${currentTrack.status})` : 'Track Game Progress'}
              </Button>
            </div>
          </div>

          {/* Right Column: Title, Quick Stats, Synopsis */}
          <div className="flex-1 min-w-0 pt-2 md:pt-14">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#00FFD1]/15 text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#00FFD1]/30">
                  {game.format}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                  {game.releaseYear}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] tracking-tight">
                {game.title}
              </h1>
              <p className="text-sm text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] font-medium">
                Developed by <span className="text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] font-semibold">{game.developer}</span> • Published by {game.publisher}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Score Rating
                </span>
                <span className="text-lg font-bold font-mono text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] mt-1 block">
                  {game.averageScore}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00FFD1]" /> Hours Played
                </span>
                <span className="text-lg font-bold font-mono text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] mt-1 block">
                  {game.hoursPlayed.toFixed(1)} hrs
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00FFD1]" /> Popularity
                </span>
                <span className="text-lg font-bold font-mono text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] mt-1 block">
                  #{game.popularity.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Achievements
                </span>
                <span className="text-lg font-bold font-mono text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] mt-1 block">
                  {game.achievements.unlocked}/{game.achievements.total} ({achievementPercentage}%)
                </span>
              </div>
            </div>

            {/* Synopsis & Genre Pills */}
            <div className="p-6 rounded-2xl bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00FFD1]" /> About the Game
              </h3>
              <p className="text-sm text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] leading-relaxed whitespace-pre-line">
                {game.summary}
              </p>

              <div className="pt-3 border-t border-[#22354B]/60 dark:border-[#22354B]/60 light:border-[#E2E8F0] flex flex-wrap gap-2">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-xl bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#F1F5F9] text-xs font-semibold text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]"
                  >
                    #{g}
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

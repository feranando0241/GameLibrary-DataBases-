import {
  BookOpenIcon,
  ClockIcon,
  CompassIcon,
  CpuIcon,
  CrosshairIcon,
  CrownIcon,
  FireIcon,
  GhostIcon,
  GlobeHemisphereWestIcon,
  MapTrifoldIcon,
  RepeatIcon,
  SkullIcon,
  SteeringWheelIcon,
  SwordIcon,
  type Icon,
} from '@phosphor-icons/react';
import type { Game, UserGame } from '../../shared/domain/game';

/** True when any of the game's genres contains `term` (case-insensitive). */
export const hasGenre = (game: Game, term: string) =>
  game.genres.some((genre) => genre.toLowerCase().includes(term.toLowerCase()));

const genre = (term: string) => (game: Game) => hasGenre(game, term);

/**
 * Single source for the sidebar collections. Order = display order.
 * `matches` is used by both the filter and the sidebar counts, so they can't disagree.
 */
export const COLLECTIONS: {
  id: string;
  label: string;
  icon: Icon;
  /** `userGame` is the current user's row for this game, if any. */
  matches: (game: Game, userGame?: UserGame) => boolean;
}[] = [
  { id: 'Action', label: 'Action & Combat', icon: FireIcon, matches: genre('Action') },
  { id: 'RPG', label: 'RPGs & Fantasy', icon: SwordIcon, matches: genre('RPG') },
  { id: 'Open World', label: 'Open World', icon: GlobeHemisphereWestIcon, matches: genre('Open World') },
  { id: 'Shooter', label: 'Shooters & FPS', icon: CrosshairIcon, matches: (g) => hasGenre(g, 'shooter') || hasGenre(g, 'fps') },
  { id: 'Souls-like', label: 'Souls-like & Tough', icon: SkullIcon, matches: genre('Souls-like') },
  { id: 'Roguelike', label: 'Roguelike & Dungeons', icon: RepeatIcon, matches: genre('Roguelike') },
  { id: 'Strategy', label: 'Strategy & 4X', icon: CrownIcon, matches: genre('Strategy') },
  { id: 'Sci-Fi', label: 'Sci-Fi & Cyberpunk', icon: CpuIcon, matches: genre('Sci-Fi') },
  { id: 'Horror', label: 'Survival & Horror', icon: GhostIcon, matches: genre('Horror') },
  { id: 'Metroidvania', label: 'Metroidvania & Platformer', icon: MapTrifoldIcon, matches: genre('Metroidvania') },
  { id: 'Racing', label: 'Racing & Driving', icon: SteeringWheelIcon, matches: genre('Racing') },
  { id: 'Story Rich', label: 'Story Rich Narrative', icon: BookOpenIcon, matches: genre('Story Rich') },
  { id: 'Indie', label: 'Indie Highlights', icon: CompassIcon, matches: genre('Indie') },
  { id: 'Backlog', label: 'Backlog (Unplayed)', icon: ClockIcon, matches: (_, ug) => !ug?.hoursPlayed },
];

/** Lookup by id; undefined for unknown ids, which the filter treats as a plain genre search. */
export const COLLECTION = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c])) as Record<
  string,
  (typeof COLLECTIONS)[number] | undefined
>;

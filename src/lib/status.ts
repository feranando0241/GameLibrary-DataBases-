import {
  BookmarkSimpleIcon,
  PauseIcon,
  PlayIcon,
  TrophyIcon,
  XIcon,
  type Icon,
} from '@phosphor-icons/react';
import type { UserTrackingStatus } from '../types/game';

/**
 * Single source for how a tracking status looks and reads. Order = display order.
 * Every status has color + icon + label, so it never relies on color alone.
 * Hues avoid the sky-blue accent; all dark-label pills are ≥6.9:1.
 */
export const STATUSES: {
  id: UserTrackingStatus;
  label: string;
  icon: Icon;
  /** Icon / text tint on dark surfaces */
  text: string;
  /** Solid pill: background + dark label */
  pill: string;
}[] = [
  { id: 'CURRENT', label: 'Playing', icon: PlayIcon, text: 'text-green-400', pill: 'bg-green-400 text-canvas' }, // go
  { id: 'PLANNING', label: 'Plan to Play', icon: BookmarkSimpleIcon, text: 'text-slate-400', pill: 'bg-slate-400 text-canvas' }, // saved for later, no color yet
  { id: 'COMPLETED', label: 'Completed', icon: TrophyIcon, text: 'text-yellow-400', pill: 'bg-yellow-400 text-canvas' }, // achievement
  { id: 'PAUSED', label: 'On Hold', icon: PauseIcon, text: 'text-orange-400', pill: 'bg-orange-400 text-canvas' }, // caution / paused
  { id: 'DROPPED', label: 'Dropped', icon: XIcon, text: 'text-red-400', pill: 'bg-red-400 text-canvas' }, // stopped
];

/** Lookup by id, e.g. STATUS[userGame.status].label. */
export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
  UserTrackingStatus,
  (typeof STATUSES)[number]
>;

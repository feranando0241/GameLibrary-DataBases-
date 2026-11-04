import React, { useEffect, useRef, useState } from 'react';
import {
  CheckIcon,
  ClockIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { Game, UserGame, UserTrackingStatus } from '../../shared/domain/game';
import { STATUSES } from '../../shared/domain/status';
import { Button } from '../../shared/ui/Button';

interface TrackingModalProps {
  game: Game;
  onClose: () => void;
  /** The current user's row for this game, if any */
  userGame?: UserGame;
  /** Persists the changed fields; rejects on failure so the modal can stay open and show the error */
  onSave: (changes: Partial<UserGame>) => Promise<void>;
}

const sectionLabel = 'block text-sm font-semibold text-ink mb-2';
const stepper =
  'w-9 h-9 rounded-lg bg-elevated text-ink font-bold hover:bg-accent hover:text-canvas transition-colors flex items-center justify-center';

/** Matches the input's min/max and keeps one decimal, so 64.8 + 1 stores 65.8, not 65.80000000000001. */
const MAX_HOURS = 9999;
const clampHours = (h: number) => Math.round(Math.min(MAX_HOURS, Math.max(0, h || 0)) * 10) / 10;

/** Native <dialog>: focus trap, Escape and top-layer backdrop come from the browser. */
export const TrackingModal: React.FC<TrackingModalProps> = ({
  game,
  onClose,
  userGame,
  onSave,
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  const isTracked = Boolean(userGame?.status);
  const [status, setStatus] = useState<UserTrackingStatus>(userGame?.status ?? 'CURRENT');
  // null = not rated; the community average is only where the slider starts
  const [score, setScore] = useState<number | null>(userGame?.score ?? null);
  const [hours, setHours] = useState<number>(userGame?.hoursPlayed ?? 0);
  const [notes, setNotes] = useState<string>(userGame?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Closing mid-save would hide a failure, so every close path is blocked until the save settles.
  const close = () => !isSaving && onClose();

  // Only the tracking fields are sent; the API merges them, so favorite etc. are kept.
  const save = async (changes: Partial<UserGame>) => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(changes);
      onClose();
    } catch {
      setError('Could not save your changes. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="tracking-title"
      onCancel={(e) => isSaving && e.preventDefault()}
      onClose={onClose}
      // Click on the backdrop (the dialog element itself, outside the inner panel) closes
      onClick={(e) => e.target === e.currentTarget && close()}
      className="w-[calc(100%-2rem)] max-w-lg p-0 bg-surface text-ink border border-line rounded-2xl shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <img
              src={game.coverUrl}
              alt=""
              className="w-12 h-16 object-cover rounded-xl border border-line shrink-0"
            />
            <div>
              <h2 id="tracking-title" className="font-bold text-base text-ink line-clamp-1">
                {game.title}
              </h2>
              <p className="text-xs text-muted">
                {game.developer} • {game.format}
              </p>
            </div>
          </div>

          <button
            onClick={close}
            disabled={isSaving}
            aria-label="Close"
            className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-elevated transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Play status: native radios = arrow-key navigation for free */}
        <fieldset>
          <legend className={sectionLabel}>Play Status</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STATUSES.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold border cursor-pointer transition-colors bg-canvas text-muted border-line hover:text-ink has-[:checked]:bg-elevated has-[:checked]:text-ink has-[:checked]:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
              >
                <input
                  type="radio"
                  name="play-status"
                  value={opt.id}
                  checked={status === opt.id}
                  onChange={() => setStatus(opt.id)}
                  className="sr-only"
                />
                <opt.icon weight="fill" className={`w-3.5 h-3.5 ${opt.text}`} aria-hidden />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Score & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-canvas border border-line">
            <div className="flex items-center justify-between text-xs mb-2">
              <label
                htmlFor="track-score"
                className="text-sm font-semibold text-ink flex items-center gap-1.5"
              >
                <StarIcon className="w-3.5 h-3.5" /> Your Score
              </label>
              <span className="font-mono font-bold text-sm text-ink">
                {score === null ? 'Not rated' : `${score} / 100`}
              </span>
            </div>
            <input
              id="track-score"
              type="range"
              min="0"
              max="100"
              step="1"
              value={score ?? game.averageScore}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas border border-line">
            <label
              htmlFor="track-hours"
              className="text-sm mb-2 font-semibold text-ink flex items-center gap-1.5"
            >
              <ClockIcon className="w-3.5 h-3.5" /> Hours Played
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHours((h) => clampHours(h - 1))}
                aria-label="Remove one hour"
                className={stepper}
              >
                −
              </button>
              <input
                id="track-hours"
                type="number"
                min="0"
                max={MAX_HOURS}
                step="0.1"
                value={hours}
                onChange={(e) => setHours(clampHours(Number(e.target.value)))}
                className="min-w-0 flex-1 text-center bg-surface text-ink font-mono font-bold text-sm py-1.5 rounded-lg border border-line outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={() => setHours((h) => clampHours(h + 1))}
                aria-label="Add one hour"
                className={stepper}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="track-notes" className={sectionLabel}>
            Notes
          </label>
          <textarea
            id="track-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you are, what you thought of it…"
            rows={3}
            className="w-full bg-canvas text-ink text-sm p-3 rounded-xl border border-line outline-none focus:ring-2 focus:ring-accent placeholder-muted"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {isTracked ? (
            <button
              onClick={() => save({ status: null, score: null, notes: null })}
              disabled={isSaving}
              className="text-sm text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-2 -ml-2"
            >
              <TrashIcon className="w-4 h-4" /> Stop Tracking
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="md" onClick={close} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => save({ status, score, hoursPlayed: hours, notes: notes.trim() || null })}
              disabled={isSaving}
              leftIcon={<CheckIcon className="w-4 h-4" />}
            >
              {isTracked ? 'Save Changes' : 'Start Tracking'}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

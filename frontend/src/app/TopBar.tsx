import React, { useEffect, useState } from 'react';
import {
  CaretDownIcon,
  DownloadSimpleIcon,
  GameControllerIcon,
  GearSixIcon,
  HardDrivesIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from '@phosphor-icons/react';

import { GeekbondLogo } from '../shared/ui/GeekbondLogo';

// Picks the shortcut hint shown in the search box (⌘K vs Ctrl+K); App handles both keys.
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/**
 * Sticky header: logo, global search (focus with Ctrl/⌘+K) and the downloads/profile menus.
 * The search text lives in App's filter state. The downloads and profile menus are UI-only
 * placeholders with hard-coded data until there are user accounts.
 */
export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const [showDownloads, setShowDownloads] = useState(false);
  const [downloadProgress] = useState(68);
  const [isDownloadPaused, setIsDownloadPaused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Escape closes whichever popover is open
  useEffect(() => {
    if (!showDownloads && !showProfileMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloads(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showDownloads, showProfileMenu]);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface/95 backdrop-blur-md border-b border-line px-3 md:px-6 flex items-center justify-between gap-1 transition-colors">
      {/* Left: Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <GameControllerIcon className="w-5 h-5 text-canvas" />
        </div>
        <GeekbondLogo size="sm" showSubtitle={false} className="hidden sm:flex" />
      </div>

      {/* Center: Search & Shortcut */}
      <div className="flex-1 min-w-0 max-w-xl mx-3 md:mx-8">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
          <input
            id="global-search-input"
            type="search"
            aria-label="Search games"
            placeholder="Search games…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-elevated text-ink placeholder-muted text-sm rounded-xl pl-10 pr-24 py-2 [&::-webkit-search-cancel-button]:hidden border border-line transition-all outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg text-muted hover:text-accent transition-colors"
                aria-label="Clear search"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold text-muted bg-surface border border-line rounded-lg shadow-sm select-none">
              {IS_MAC ? '⌘K' : 'Ctrl K'}
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions, Downloads, Theme, User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Downloads Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowDownloads(!showDownloads)}
            className="relative p-2 rounded-xl text-muted hover:text-accent hover:bg-elevated border border-transparent transition-all outline-none focus:ring-2 focus:ring-accent"
            aria-label="Downloads"
            aria-expanded={showDownloads}
            id="downloads-btn"
          >
            <DownloadSimpleIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent motion-safe:animate-pulse" />
          </button>

          {/* Downloads Popover */}
          {showDownloads && (
            <div className="absolute right-0 mt-3 w-80 bg-surface border border-line rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <DownloadSimpleIcon className="w-4 h-4 text-muted" />
                  <span className="text-xs font-semibold text-ink">Active Downloads (1)</span>
                </div>
                <button
                  onClick={() => setShowDownloads(false)}
                  aria-label="Close downloads"
                  className="text-muted hover:text-ink p-1"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3.5 space-y-3">
                <div className="p-3 rounded-xl bg-elevated border border-line">
                  <div className="flex items-center justify-between text-xs font-medium text-ink mb-1.5">
                    <span className="truncate max-w-[160px]">Cyberpunk 2077 Update 2.13</span>
                    <span className="text-ink font-mono font-bold">{downloadProgress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-canvas h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent to-accent-hover h-full rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>42.8 MB/s • ETA: 4m 12s</span>
                    <button
                      onClick={() => setIsDownloadPaused(!isDownloadPaused)}
                      className="hover:text-accent flex items-center gap-1 font-semibold"
                    >
                      {isDownloadPaused ? (
                        <>
                          <PlayIcon className="w-3 h-3 text-accent" /> Resume
                        </>
                      ) : (
                        <>
                          <PauseIcon className="w-3 h-3 text-muted" /> Pause
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-xl bg-elevated border border-line hover:border-accent/50 transition-all outline-none focus:ring-2 focus:ring-accent"
            id="user-profile-btn"
            aria-label="Account"
            aria-expanded={showProfileMenu}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                alt=""
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-line"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent ring-2 ring-surface" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-ink">Alex Vance</span>
              <span className="text-xs text-muted font-mono font-bold leading-none">LVL 42</span>
            </div>
            <CaretDownIcon className="hidden sm:block w-3.5 h-3.5 text-muted" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-surface border border-line rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-line mb-1">
                <p className="text-xs font-semibold text-ink">Alex Vance</p>
                <p className="text-xs text-muted">alex.vance@example.com</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted bg-elevated px-2 py-1 rounded-lg font-bold">
                  <span>Geekbond Pro Member</span>
                  <span className="font-mono">ONLINE</span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-ink hover:bg-elevated rounded-lg transition-colors flex items-center gap-2"
              >
                <GearSixIcon className="w-3.5 h-3.5" /> Launcher Preferences
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-ink hover:bg-elevated rounded-lg transition-colors flex items-center gap-2"
              >
                <HardDrivesIcon className="w-3.5 h-3.5" /> Storage Folders
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

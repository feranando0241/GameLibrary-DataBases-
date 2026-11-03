import React, { useState } from 'react';
import {
  Gamepad2,
  Search,
  Download,
  Settings,
  X,
  ChevronDown,
  HardDrive,
  Pause,
  Play,
} from 'lucide-react';

import { GeekbondLogo } from '../ui/GeekbondLogo';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalGamesCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  setSearchQuery,
  totalGamesCount,
}) => {
  const [showDownloads, setShowDownloads] = useState(false);
  const [downloadProgress] = useState(68);
  const [isDownloadPaused, setIsDownloadPaused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#131F2E]/95 dark:bg-[#131F2E]/95 light:bg-white/95 backdrop-blur-md border-b border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left: Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FFD1] to-[#00C4A7] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,209,0.4)]">
          <Gamepad2 className="w-5 h-5 text-[#0B141E]" />
        </div>
        <GeekbondLogo size="sm" />
      </div>

      {/* Center: Search & Shortcut */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder={`Search ${totalGamesCount} games, developers, genres...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#F1F5F9] text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] placeholder-[#8BA0B2] dark:placeholder-[#8BA0B2] light:placeholder-[#64748B] text-sm rounded-xl pl-10 pr-24 py-2 border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] transition-all outline-none focus:ring-2 focus:ring-[#00FFD1] focus:border-transparent focus:shadow-[0_0_15px_rgba(0,255,209,0.25)]"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-[#8BA0B2] hover:text-[#00FFD1] transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] rounded-md shadow-sm select-none">
              <span className="text-xs">⌘</span>K
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
            className="relative p-2 rounded-xl text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B] hover:text-[#00FFD1] hover:bg-[#1A2A3D] dark:hover:bg-[#1A2A3D] light:hover:bg-[#E2E8F0] border border-transparent transition-all outline-none focus:ring-2 focus:ring-[#00FFD1]"
            title="Download Manager"
            id="downloads-btn"
          >
            <Download className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#00FFD1] animate-pulse shadow-[0_0_8px_#00FFD1]" />
          </button>

          {/* Downloads Popover */}
          {showDownloads && (
            <div className="absolute right-0 mt-3 w-80 bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#00FFD1]" />
                  <span className="text-xs font-semibold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">Active Downloads (1)</span>
                </div>
                <button
                  onClick={() => setShowDownloads(false)}
                  className="text-[#8BA0B2] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3.5 space-y-3">
                <div className="p-3 rounded-xl bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#F8FAFC] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1]">
                  <div className="flex items-center justify-between text-xs font-medium text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] mb-1.5">
                    <span className="truncate max-w-[160px]">Cyberpunk 2077 Update 2.13</span>
                    <span className="text-[#00FFD1] font-mono font-bold">{downloadProgress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-[#0B141E] dark:bg-[#0B141E] light:bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00FFD1] to-[#00E5BC] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,255,209,0.4)]"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]">
                    <span>42.8 MB/s • ETA: 4m 12s</span>
                    <button
                      onClick={() => setIsDownloadPaused(!isDownloadPaused)}
                      className="hover:text-[#00FFD1] flex items-center gap-1 font-semibold"
                    >
                      {isDownloadPaused ? (
                        <>
                          <Play className="w-3 h-3 text-[#00FFD1]" /> Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 text-amber-400" /> Pause
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
            className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-xl bg-[#1A2A3D] dark:bg-[#1A2A3D] light:bg-[#F1F5F9] border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] hover:border-[#00FFD1]/50 transition-all outline-none focus:ring-2 focus:ring-[#00FFD1]"
            id="user-profile-btn"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                alt="Avatar"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#22354B]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FFD1] ring-2 ring-[#131F2E] dark:ring-[#131F2E] light:ring-white" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">Alex Vance</span>
              <span className="text-[10px] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] font-mono font-bold leading-none">LVL 42</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[#131F2E] dark:bg-[#131F2E] light:bg-white border border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#22354B] dark:border-[#22354B] light:border-[#CBD5E1] mb-1">
                <p className="text-xs font-semibold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A]">Alex Vance</p>
                <p className="text-[11px] text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#64748B]">alex.vance@uofl.edu</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] bg-[#00FFD1]/10 px-2 py-1 rounded-md font-bold">
                  <span>Geekbond Pro Member</span>
                  <span className="font-mono">ONLINE</span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-xs text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#475569] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D] dark:hover:bg-[#1A2A3D] light:hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" /> Launcher Preferences
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-xs text-[#8BA0B2] dark:text-[#8BA0B2] light:text-[#475569] hover:text-[#F1F5F9] dark:hover:text-[#F1F5F9] light:hover:text-[#0F172A] hover:bg-[#1A2A3D] dark:hover:bg-[#1A2A3D] light:hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-2"
              >
                <HardDrive className="w-3.5 h-3.5" /> Storage Folders
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

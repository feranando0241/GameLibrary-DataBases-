# GameLibrary-DataBases-
This is the repository for the Videogame Library that we are going to do for the DataBase UofL Class FALL2026.

## Geekbond — Game Library & AniList Discovery Platform

A modern, high-performance entertainment library, discovery, and tracking platform built with **React 19**, **TypeScript 5 (Strict Mode)**, and **Tailwind CSS 3.4**. It combines the **Geekbond PC/Console Game Library & Launcher** with the **AniList Frontend Architecture & GraphQL API v2**.

### 1. Architectural Highlights
- **Title & Typography:** **Geekbond** in high-contrast Didone/Bodoni typography (*Bodoni Moda* 900) paired with *Plus Jakarta Sans* and *JetBrains Mono*.
- **Dense Multi-faceted Filter Bar:** Layered real-time search and multi-select filtering:
  - Media Switcher: *All Media*, *Games*, *AniList Anime*
  - Genres (Action, RPG, Sci-Fi, Adventure, Fantasy, etc.)
  - Year / Era (2025, 2024, 2023, 2020s, 2010s, Classics)
  - Format (*Video Game*, *TV*, *Movie*, *OVA*)
  - Status (*Installed*, *Releasing*, *Finished*, *Backlog*)
  - Sorting (*Trending*, *Top Rated / Score*, *Most Popular*, *Title*, *Release Date*)
- **Standardized 2:3 Card Wall:**
  - Dynamic score badges (e.g. `98%`) with color-coded ratings
  - Bottom airing countdown or game install status
  - User tracking status pills (*Playing*, *Planning*, *Completed*, *On Hold*, *Dropped*)
  - Quick-track `+` button opening the tracking drawer
- **Comprehensive Media Hubs:**
  - Full-width panoramic banner with bottom-gradient fade
  - Overlapping 2:3 poster card
  - Left stats sidebar (Average Score, Popularity ranking, Studio/Developer, Storage/Episodes)
  - Interactive **User Tracking Drawer** (`TrackingModal.tsx`): Status, 100-point score slider, hours/episode counter, personal reviews/notes
  - Game launcher triggers (*PLAY NOW*, *INSTALL*) and local disk size monitoring
- **AniList Public GraphQL Integration:**
  - Direct read-only connection to `https://graphql.anilist.co` for live anime trends, studios, airing countdowns, and scores
- **Storage & App Shell:**
  - NVMe Storage Gauge showing installed GB vs capacity
  - Download manager popover with simulated progress
  - High-contrast Dark (`#0B1622` / `#151F2E`) and Light (`#EDF1F5`) themes

### 2. Running Locally
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production build
npm run build
```

### 3. Running with the real backend

The API lives in `backend/` (Express + `mysql2`). In development Vite proxies `/api` to the API, so the frontend uses relative URLs and the browser needs no CORS.

```bash
# 1. Start MySQL and apply database/migrations + database/seeds (see backend/README.md)
# 2. Configure the connection
cp backend/.env.example backend/.env

# Terminal A — API on http://localhost:3000
npm run api

# Terminal B — frontend on http://localhost:5173
npm run dev
```

Full verification (backend typecheck, lint, all tests, production build):

```bash
npm run verify
```

# Architecture Review: Geekbond

**Date:** 2026-11-04
**Scope:** frontend on branch `Testing-Frontend` (commit `9c8cf74`)
**Related:** [ADR-0001: Database engine and data-access layer](adr/0001-database-and-data-access-layer.md)

> Snapshot of the code at `9c8cf74`. File paths below refer to that layout; the current modular structure is in [architecture.md](architecture.md).

---

## 1. Executive summary

Geekbond is a React 19 + TypeScript + Tailwind single-page app built with Vite. The UI is in good shape. Components are split by domain, status styling is centralized and accessible, and the app uses native browser elements where they fit (`<dialog>`).

The main risk is **data handling**. All state, mock data, filtering logic, and layout live in one file (`src/App.tsx`, 584 lines), and components depend directly on the shape of the mocks. That is fine for a visual prototype, but connecting the database today would mean rewriting a large part of the UI.

The proposed improvements are incremental. None of them requires rewriting working code, and they are ordered so that each step can be verified before the next one starts (section 5).

| Priority | Findings |
|----------|----------|
| High | No data-access layer · Two sources of truth for hours played · Model mixes catalog and per-user data · `App.tsx` has too many responsibilities |
| Medium | Genre catalog defined three times · Weakly typed filters · `lastPlayed` stored as display text · No tests or CI · Views have no URLs |
| Low | Outdated README · `strict` not declared · Unmarked simulated UI |

---

## 2. Current state

### Stack
| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 3.4, Phosphor Icons |
| Language | TypeScript 6 (`noUnusedLocals`, `noUnusedParameters`) |
| Build / dev | Vite 8 |
| Quality | oxlint (`rules-of-hooks` as error) |
| Data | `src/data/mockGames.ts` + in-memory state |
| Backend / DB | Not built yet (see ADR-0001) |

### Structure
```
src/
├── App.tsx                 ← global state, seed data, filtering, counts and layout
├── types/game.ts           ← domain types
├── data/mockGames.ts       ← mock catalog
├── lib/
│   ├── status.ts           ← single source for tracking statuses (well done)
│   └── filters.ts          ← filter state shape
└── components/
    ├── layout/             ← TopBar, Sidebar, PixelWaves
    ├── discover/           ← FilterBar, MediaCard
    ├── library/            ← GameListView
    ├── media-detail/       ← MediaHero
    ├── tracker/            ← TrackingModal
    └── ui/                 ← Button, GeekbondLogo
```

### Current data flow
```
mockGames.ts ──► App.tsx (useState) ──► filter/sort in useMemo ──► props ──► components
                     ▲                                                     │
                     └────────── callbacks (onSave, onToggleFavorite) ◄────┘
```
Nothing persists. Reloading the page loses favorites and tracking entries.

### Git workflow
- Fork model: `origin` and `upstream` remotes, with `main`, `Frontend`, and `Testing-Frontend` branches.
- Commit messages use conventional prefixes (`feat:`). Keep doing this.
- There are no automated checks before merging into `main`.

---

## 3. Strengths (keep these)

- **`src/lib/status.ts` as a single source of truth.** Each status's label, icon, and color are defined in one place and never rely on color alone. **This is the pattern to copy** for genres, platforms, and sort options.
- **Components grouped by domain** (`discover`, `library`, `tracker`, …), with typed props and no hidden global state.
- **Uses the platform**: a native `<dialog>` for the modal (focus, Escape, and backdrop come from the browser), with correct `aria-*` attributes.
- **Domain types kept separate** in `src/types/game.ts`.
- **`filters.ts` already plans for the database.** Its comment says the filter state will map to query parameters.

---

## 4. Findings and recommendations

### High priority

#### H1. There is no data-access layer
- **Evidence:** `App.tsx:9` imports `mockGames` directly. The sample tracking entries are hard-coded inside the component (`App.tsx:34-99`). Mutations call `setGames` / `setUserTracks` with nothing in between.
- **Risk:** connecting the database would mean touching `App.tsx` and every component that depends on how data is loaded. There is also no loading or error handling.
- **Recommendation:** add `src/lib/api.ts` with async functions (`getGames()`, `saveTrack()`, `deleteTrack()`, `toggleFavorite()`) that **return the mocks at first**. `App.tsx` calls only this module. When the backend exists, only the inside of `api.ts` changes. Move the `userTracks` seed data into `src/data/`.

#### H2. Two sources of truth for hours played
- **Evidence:** `Game.hoursPlayed` (shown by `MediaCard.tsx:76`, `GameListView.tsx:141`, and `MediaHero.tsx:125`) vs. `UserTrackEntry.progress` (edited in `TrackingModal`). Saving a tracking entry (`App.tsx:139`) updates only `progress`.
- **Risk (current bug):** if a user changes their hours in the modal and saves, the cards, table, and detail view keep showing the old value. The mocks already disagree (Cyberpunk: 142.5 h vs. 142 h).
- **Recommendation:** keep a single source. Hours are per-user data and belong on the tracking record (`user_games.hours_played` in the ADR schema). `isFavorite` follows the same rule.

#### H3. The `Game` type mixes catalog and per-user data
- **Evidence:** `src/types/game.ts` combines game data (`title`, `developer`, `genres`) with personal data (`isFavorite`, `isInstalled`, `hoursPlayed`, `lastPlayed`, `achievements.unlocked`). `averageScore` and `popularity` are stored as constants even though they are aggregates.
- **Risk:** this model cannot represent more than one user, and stored averages go stale.
- **Recommendation:** split `Game` (catalog) from `UserGame` (the user–game relationship), as in the ADR-0001 schema, and compute average score and popularity with the `game_stats` view.

#### H4. `App.tsx` has too many responsibilities
- **Evidence:** its 584 lines hold seed data, seven `useState` hooks, keyboard shortcuts, filtering and sorting (~110 lines), genre and status counts, the label map, the dynamic page title, and the whole layout.
- **Risk:** almost every change touches this file. That causes merge conflicts between teammates and regressions that are hard to spot. The filtering logic cannot be tested on its own.
- **Recommendation:** extract these without changing behavior:
  1. Filtering and sorting into a **pure function** `applyFilters(games, tracks, filters)` in `src/lib/filters.ts`. It can be tested, and later it maps to the backend's `WHERE` / `ORDER BY`.
  2. The counts into `src/lib/`, next to that function.
  3. The library view layout, only if the file keeps growing.

### Medium priority

#### M1. The genre catalog is defined three times
- **Evidence:** `genreLabelMap` (`App.tsx:298`), `genresList` (`App.tsx:317`), and `collections` (`Sidebar.tsx:57`). The special Backlog and Shooter rules are duplicated between the filter (`App.tsx:167-180`) and the counts (`App.tsx:336-345`).
- **Risk:** adding or renaming a genre means editing three places. If one is missed, the sidebar count stops matching the filter result.
- **Recommendation:** add a `src/lib/collections.ts` that follows the `status.ts` pattern (id, label, icon, and a `matches(game)` function). The filter and the counts both use the same `matches`.

#### M2. Weakly typed filters
- **Evidence:** every field in `FilterBarState` is a `string`. `SORT_FIELD` is `Record<string, SortField>`. `STORAGE_DESC` is handled by the sort at `App.tsx:244` but is missing from `SORT_FIELD` and from the dropdown. The platform options in `FilterBar.tsx:85-89` repeat the `GameFormat` type by hand. The year dropdown still says "2025 (Upcoming)", but it is 2026.
- **Risk:** a typo in a filter value compiles without warning and silently filters nothing.
- **Recommendation:** use union types (`sort: SortKey`, `platform: GameFormat | ''`) and generate the options from constants, so the compiler catches mismatches.

#### M3. `lastPlayed` is display text used in logic
- **Evidence:** values such as `'Yesterday'` and `'Never'`, and the Backlog rule checks `g.lastPlayed === 'Never'`.
- **Recommendation:** store an ISO timestamp or `null`, and format it only when displaying it, with `Intl.RelativeTimeFormat` (built into the browser, no dependency).

#### M4. No tests or continuous integration
- **Evidence:** the only scripts are `dev`, `build`, `lint`, and `preview`. There is no workflow in `.github/`.
- **Risk:** nothing stops code that doesn't compile, or a broken filter, from reaching `main`.
- **Recommendation:**
  - A GitHub Actions workflow that runs `npm ci && npm run lint && npm run build` on every PR.
  - Vitest (it reuses the Vite config), **only** for the pure functions in `lib/`: filters, counts, and data mapping. Visual components don't need tests yet.
  - Branch protection on `main`: PRs required, with checks passing.

#### M5. Views have no URLs
- **Evidence:** the game detail view and the filters exist only in `useState`.
- **Risk:** reloading loses the current view, the browser Back button leaves the app, and a link to a game can't be shared.
- **Recommendation:** once there is more than one real screen, put `gameId` and the filters in the URL (`URLSearchParams` is enough to start). Not urgent.

#### M6. Filtering happens in the browser
- **Context:** with 20 games this is the right choice. With a real catalog, downloading everything to filter it in the browser does not scale.
- **Recommendation:** after H4, the `applyFilters` function defines the contract. Once the API exists, the same filters are sent as query parameters (`GET /api/games?genre=RPG&sort=SCORE_DESC`) and resolved in SQL with indexes.

### Low priority

#### L1. The README describes features that don't exist
- **Evidence:** it lists AniList GraphQL integration, an NVMe storage gauge, a light theme, and "TypeScript 5 (Strict Mode)". The NVMe gauge and the theme toggle were removed in `f6d0265`, AniList was never implemented, and the project uses TypeScript 6.
- **Risk:** it misleads new teammates and the course grader.
- **Recommendation:** have the README describe only what exists, and move planned work into a "Roadmap" section.

#### L2. `strict` is not declared
- **Evidence:** `tsconfig.app.json` has no `"strict": true`. TypeScript 6 turns it on by default, but that depends on the compiler version.
- **Recommendation:** declare it explicitly (one line).

#### L3. Unmarked simulated UI
- **Evidence:** the download manager in `TopBar.tsx:28` has its progress fixed at 68%. The package is named `nexus-game-library`.
- **Recommendation:** remove what is outside the course scope, or clearly mark it as a demo. Rename the package to `geekbond`.

---

## 5. Proposed roadmap

Each phase leaves the app working and can be merged on its own.

| Phase | Goal | Contents | Does the user see a change? |
|-------|------|----------|-----------------------------|
| **0. Safety net** | Catch breakage before merging | CI (lint + build), `main` branch protection, explicit `strict`, corrected README | No |
| **1. Refactor without changing behavior** | Make the logic testable and defined once | `applyFilters` and counts in `lib/` with tests, `collections.ts`, typed filters | No |
| **2. Data seam** | Decouple the UI from the data source | `src/lib/api.ts` over the mocks, seed data out of `App.tsx`, hours and favorites unified (fixes H2) | Yes: the modal now updates the visible hours |
| **3. Database** | Real persistence | Per ADR-0001: MySQL, `backend/` (Express + `mysql2`), `database/migrations/`, seeds, endpoints. `api.ts` switches from mocks to `fetch` | Yes: data persists |
| **4. Scale** | Grow catalog and users | Server-side filtering, URLs per view, authentication (its own ADR) | Yes |

Phases 0 and 1 are small and low-risk. They are worth doing **before** connecting the database, so the migration happens with tests and CI already in place.

---

## 6. Proposed working agreements

Simple rules so the project can grow without breaking what already works:

1. **Components never import from `src/data/`.** All data comes in through `src/lib/api.ts`.
2. **One constant per concept.** Statuses, genres, platforms, and sort options are defined once in `src/lib/`, and the UI iterates over them. Lists are never repeated by hand.
3. **Logic lives in pure functions; components only render.** Filtering, sorting, counting, and data mapping happen in `lib/` and are tested there.
4. **Nothing reaches `main` without a PR and passing checks.** Commits keep conventional prefixes (`feat:`, `fix:`, `refactor:`, `docs:`).
5. **The database schema is versioned.** Each change is a numbered SQL file (`db/migrations/001_init.sql`, `002_...`), and an applied migration is never edited.
6. **Significant decisions are recorded as ADRs** in `docs/adr/` (database engine, authentication, deployment).
7. **The README reflects the real state of the project.** Planned work goes in the Roadmap section.

# ADR-0001: Database engine and data-access layer for Geekbond

**Status:** Accepted
**Date:** 2026-11-04 (updated 2026-11-04: DBMS set to MySQL)
**Deciders:** Geekbond team (UofL Databases, Fall 2026)

## Context

- The frontend (React 19 + Vite + TypeScript) runs entirely on in-memory data. `src/App.tsx` seeds `useState` from `src/data/mockGames.ts` and hard-codes the initial `userTracks`. There is no backend.
- Mutations (`handleToggleFavorite`, `handleSaveTrack`, `handleDeleteTrack`) call `setGames` / `setUserTracks` directly, so nothing persists across reloads.
- The `Game` type (`src/types/game.ts`) mixes **catalog** data (title, developer, releaseYear, genres) with **per-user** data (`isFavorite`, `isInstalled`, `hoursPlayed`, `lastPlayed`, `achievements.unlocked`). `averageScore` and `popularity` are stored constants, though they are really aggregates of user ratings.
- This is a databases course project: the schema, constraints, and SQL are part of what gets graded, so they should be visible and hand-written, not hidden behind an ORM or SDK.
- **The team has chosen MySQL** as the DBMS. That choice is fixed; this ADR decides how the app talks to it.
- Team experience is TypeScript/React. The deadline is the end of the semester, so we want the fewest new moving parts.

## Decision

1. **MySQL 8.0.19 or later** with InnoDB (the default engine). 8.0.16+ is needed so `CHECK` constraints are enforced, and 8.0.19+ for the `INSERT … AS new ON DUPLICATE KEY UPDATE` alias syntax. Keep the default strict `sql_mode` so invalid values raise errors instead of being silently truncated.
2. A **thin Node + Express API** in `server/` that runs plain SQL through the **`mysql2`** driver (promise API, `pool.execute()` with `?` placeholders). No ORM. Vite proxies `/api` to it in development.
3. A **single data-access module on the frontend** (`src/lib/api.ts`). Components and `App.tsx` call only this module and never import `mockGames` directly. The module first wraps the mocks, then switches to `fetch('/api/...')` without the UI changing.
4. **Normalize the model.** The current `Game` type becomes a catalog row plus a per-user row, and the frontend type is assembled from the two by a query or view.
5. **Credentials come from environment variables** (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) loaded from a `.env` file that is git-ignored. A committed `.env.example` lists the variable names without values.

### Schema (first cut, validated on MySQL)

```sql
CREATE TABLE users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id                  VARCHAR(100) PRIMARY KEY,   -- keeps current slugs ('elden-ring')
  title               VARCHAR(200) NOT NULL,
  developer           VARCHAR(150) NOT NULL,
  publisher           VARCHAR(150) NOT NULL,
  release_year        SMALLINT UNSIGNED NOT NULL,
  format              ENUM('PC','PlayStation 5','Xbox Series X','Nintendo Switch','Steam Deck') NOT NULL,
  cover_url           VARCHAR(500),
  banner_url          VARCHAR(500),
  storage_gb          DECIMAL(6,1),
  achievements_total  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  summary             TEXT,
  INDEX idx_games_release_year (release_year),
  INDEX idx_games_format (format)
);

CREATE TABLE genres (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE game_genres (
  game_id   VARCHAR(100) NOT NULL,
  genre_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, genre_id),
  INDEX idx_game_genres_genre (genre_id),
  FOREIGN KEY (game_id)  REFERENCES games(id)  ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- Merges today's UserTrackEntry with the per-user fields currently on Game
CREATE TABLE user_games (
  user_id                INT UNSIGNED NOT NULL,
  game_id                VARCHAR(100) NOT NULL,
  status                 ENUM('CURRENT','PLANNING','COMPLETED','PAUSED','DROPPED'),
  score                  TINYINT UNSIGNED CHECK (score <= 100),
  hours_played           DECIMAL(7,1) NOT NULL DEFAULT 0 CHECK (hours_played >= 0),
  is_favorite            BOOLEAN NOT NULL DEFAULT FALSE,
  is_installed           BOOLEAN NOT NULL DEFAULT FALSE,
  achievements_unlocked  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  notes                  TEXT,
  last_played_at         DATETIME NULL,              -- NULL = never played
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, game_id),
  INDEX idx_user_games_game (game_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- averageScore / popularity become derived values, not stored constants
CREATE VIEW game_stats AS
SELECT g.id                              AS game_id,
       COALESCE(ROUND(AVG(ug.score)), 0) AS average_score,
       COUNT(ug.user_id)                 AS popularity
FROM games g
LEFT JOIN user_games ug ON ug.game_id = g.id
GROUP BY g.id;
```

### MySQL-specific choices

| Topic | Choice | Reason |
|-------|--------|--------|
| Fixed value lists (`status`, `format`) | `ENUM` | Native and compact, and strict mode rejects unknown values. Adding a value requires `ALTER TABLE`, which is acceptable for lists that rarely change. If platforms start changing often, move `format` to a `platforms` lookup table. |
| Text keys and unique columns | `VARCHAR(n)` | MySQL cannot index `TEXT` without a prefix length. |
| Timestamps | `DATETIME`, stored in UTC by the API | `DATETIME` has no 2038 limit and is not converted by the session time zone. The API writes UTC, and the UI formats it. |
| Booleans | `BOOLEAN` (alias of `TINYINT(1)`) | `mysql2` returns `0`/`1`. `api.ts` maps them to `true`/`false`. |
| Upsert | `INSERT … AS new ON DUPLICATE KEY UPDATE col = new.col` | Replaces Postgres `ON CONFLICT`. The older `VALUES(col)` form is deprecated. |
| Reading back a write | Follow-up `SELECT` in the same connection | MySQL has no `RETURNING`. |
| Decimals | `DECIMAL` | `mysql2` returns `DECIMAL` as strings by default. Enable `decimalNumbers: true` in the pool config. |
| Character set | `utf8mb4` (MySQL 8 default) | Full Unicode, including emoji in notes. |

**Validated:** this schema was run on the team's local MySQL (Homebrew build, server reports 26.7.0). The upsert, the `game_stats` view, the `CHECK` constraint (rejects `score = 150`), and the `ENUM` (rejects an unknown status) all behaved as expected.

## Options considered

The DBMS is fixed as MySQL, so the open question is how the app talks to it.

### Option A: Express + `mysql2` with hand-written SQL (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium: one small server plus the database |
| Cost | Free; MySQL is already installed locally |
| Scalability | More than this project needs (connection pool, indexes, views) |
| Team familiarity | High for TS/Express; SQL is what the course teaches |

**Pros:** every query is visible and easy to grade. `CHECK`, `ENUM`, foreign keys, and the view do the validation. Parameterized `execute()` prevents SQL injection.
**Cons:** we have to write and run a server and map rows to TypeScript types by hand.

### Option B: Express + an ORM (Prisma, Sequelize, or TypeORM)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium to high: new schema language plus generated client and migrations |
| Cost | Free |
| Scalability | Good |
| Team familiarity | Low |

**Pros:** typed queries and generated migrations.
**Cons:** hides the SQL the course is grading, and the schema is no longer written in SQL. Adds a large dependency and a new tool to learn.

### Option C: Query builder (Knex or Kysely)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | Free |
| Scalability | Good |
| Team familiarity | Low |

**Pros:** composes dynamic filters (H4/M6 in the architecture review) more safely than string concatenation.
**Cons:** SQL is still partly hidden, and it is one more dependency. Dynamic `WHERE` clauses for our handful of filters are a few lines with `mysql2` placeholders.

_Dismissed:_ connecting from the browser directly to MySQL. It would expose credentials, and MySQL has no row-level security.

## Trade-off analysis

The main tension is **type safety and convenience (B, C) vs. visible SQL we control (A)**. In a databases course the schema and queries are the deliverable, so A wins. The filter set is small, so building the `WHERE` clause by hand with placeholders stays manageable. If filtering grows much more complex, revisit Option C.

The frontend seam (`src/lib/api.ts`) is the part that matters most for long-term stability. It does not depend on the driver choice, and if it lands first, the backend can change without touching components.

## Consequences

- **Easier:** data persists. Aggregates (score, popularity) stay correct automatically. Adding users, reviews, or other media later means new tables, not UI rewrites.
- **Harder:** two processes in development (Vite + API) plus a running MySQL server. Rows must be mapped by hand (snake_case → camelCase, `0`/`1` → boolean). The `Game` type must be split or assembled in the API, which touches `App.tsx` and the components that read per-user fields.
- **Revisit:** authentication (currently a single hard-coded user), a `platforms` table if formats change often, and a query builder if filters grow.

## Action items

1. [x] Choose the DBMS: MySQL.
2. [x] Create `src/lib/api.ts` backed by the mocks, and route `App.tsx` reads and mutations through it (no database yet).
3. [x] Split `Game` (catalog) from `UserGame` (one `user_games` row) in `src/types/game.ts`.
4. [ ] Add `db/migrations/001_init.sql` (the schema above) and `db/seed.sql` generated from `mockGames.ts` + `mockLibrary.ts`.
5. [ ] Add `server/` (Express + `mysql2` pool with `decimalNumbers: true`), `.env.example`, and `.env` in `.gitignore`.
6. [ ] Endpoints, one per `api.ts` function: `GET /api/games`, `GET /api/me/games`, `PUT /api/me/games/:gameId` (upserts the whole row; "Stop Tracking" sets `status`, `score`, `notes` to NULL and keeps hours and favorite). `src/lib/api.test.ts` is the contract they must keep.
7. [ ] Add the Vite `/api` proxy, then switch `api.ts` from mocks to `fetch`.
8. [ ] Follow-up ADR: authentication / multi-user.

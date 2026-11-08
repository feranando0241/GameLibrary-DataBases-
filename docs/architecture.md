# Geekbond Target Architecture

Target state after phase 3 of the [architecture review](architecture-review.md) roadmap. Decisions behind it: [ADR-0001](adr/0001-database-and-data-access-layer.md).

## 1. Repository layout

The repository is split into independent modules. Each one has a README with its own rules.

```
/
├── frontend/                  React SPA (Vite)
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── app/               composition root: App, TopBar, PixelWaves
│       ├── features/          one folder per feature, public API in index.ts
│       │   ├── library/       Sidebar, FilterBar, GameGrid, GameListView, MediaCard, filters, collections
│       │   ├── game-detail/   MediaHero
│       │   └── tracking/      TrackingModal
│       └── shared/            used by everything, depends on nothing above it
│           ├── api/           api.ts (the data seam) + mocks/ (until phase 3)
│           ├── domain/        game.ts (types), status.ts
│           └── ui/            Button, GeekbondLogo
├── backend/                   Express + mysql2 API (phase 3)
├── database/
│   └── migrations/            001_init.sql, 002_…
├── tests/                     frontend/ · database/ · backend/ · architecture/ · security/
├── docs/                      architecture, ADRs, review
└── package.json, tsconfig*.json, vite/tailwind/postcss configs (shared, repo root)
```

### Module rules (enforced by `tests/architecture/`)

| Rule | Why |
|------|-----|
| `shared/` never imports `app/` or `features/` | Shared code stays reusable, and there are no import cycles |
| A feature never imports another feature | Features can be changed, or removed, independently |
| Outside a feature, import only its `index.ts` | Each feature's internals can be refactored freely |
| Only `app/` calls `shared/api/api.ts` | Data enters in one place; features get data through props |
| Only `api.ts` touches `shared/api/mocks/` | Swapping mocks for the real API changes one file |
| `frontend/` never imports `backend/` or `database/`, and vice versa | The only link between them is the HTTP contract |

Adding a feature means creating `features/<name>/` with an `index.ts`, then composing it in `app/App.tsx`.

## 2. System layers

Each layer may only call the layer directly below it. `api.ts` is the only place where the UI touches data.

```mermaid
flowchart TB
  subgraph Browser["frontend/ · React SPA (Vite)"]
    direction TB
    APP["app/<br/>App.tsx: view state + composition"]
    FEAT["features/<br/>library · game-detail · tracking<br/><i>render props; pure logic unit-tested</i>"]
    API["shared/api/api.ts<br/><i>the single data seam</i><br/>getGames · getLibrary · saveUserGame"]
    SHARED["shared/domain · shared/ui<br/>types, status, Button"]
    MOCK[("shared/api/mocks/<br/><i>until phase 3</i>")]
    APP --> FEAT
    APP --> API
    FEAT --> SHARED
    API -. "phase 2" .-> MOCK
  end

  subgraph Server["backend/ · Node + Express"]
    direction TB
    ROUTES["Routes<br/>GET /api/games<br/>GET /api/me/games<br/>PATCH /api/me/games/:gameId"]
    SQL["Hand-written SQL via mysql2 pool<br/><i>execute() with ? placeholders only</i><br/>credentials from .env"]
    ROUTES --> SQL
  end

  subgraph DB["database/ · MySQL 8 · InnoDB · utf8mb4"]
    direction TB
    TABLES[("users · games · genres<br/>game_genres · user_games")]
    VIEW[["view: game_stats<br/>average_score · popularity"]]
    MIG["migrations/001_init.sql …"]
    VIEW --> TABLES
    MIG -. "applied in order" .-> TABLES
  end

  API -- "phase 3: fetch('/api/…') JSON<br/>(Vite proxy in dev)" --> ROUTES
  SQL --> TABLES
  SQL --> VIEW
```

## 3. Data model

Migrations `001_init.sql` and `002_normalization.sql`. Normalization notes: [database/README.md](../database/README.md#data-model-and-normalization).

```mermaid
erDiagram
  USERS ||--o{ USER_GAMES : tracks
  GAMES ||--o{ USER_GAMES : "tracked by"
  USER_GAMES ||--o| REVIEWS : "reviewed in"
  COMPANIES ||--o{ GAMES : "develops / publishes"
  GAMES ||--o{ GAME_GENRES : has
  GENRES ||--o{ GAME_GENRES : groups
  GAMES ||--o{ GAME_PLATFORMS : "ships on"
  PLATFORMS ||--o{ GAME_PLATFORMS : hosts

  USERS {
    int id PK "AUTO_INCREMENT"
    varchar username UK
    varchar email UK "NULL until sign-up; CHECK looks like an address"
    varchar password_hash "bcrypt/argon2 hash, never plain text"
    datetime created_at
  }
  COMPANIES {
    int id PK "AUTO_INCREMENT"
    varchar name UK
  }
  GAMES {
    varchar id PK "slug, e.g. elden-ring (same as RAWG)"
    varchar title
    int developer_id FK "companies.id, RESTRICT"
    int publisher_id FK "companies.id, RESTRICT"
    smallint release_year "indexed"
    enum format "PC, PS5, Xbox, Switch, Steam Deck; indexed"
    varchar cover_url
    varchar banner_url
    decimal storage_gb
    smallint achievements_total
    text summary
  }
  GENRES {
    int id PK "AUTO_INCREMENT"
    varchar name UK
  }
  GAME_GENRES {
    varchar game_id PK,FK
    int genre_id PK,FK
  }
  PLATFORMS {
    int id PK "AUTO_INCREMENT"
    varchar name UK
  }
  GAME_PLATFORMS {
    varchar game_id PK,FK
    int platform_id PK,FK
  }
  USER_GAMES {
    int user_id PK,FK
    varchar game_id PK,FK
    enum status "CURRENT, PLANNING, COMPLETED, PAUSED, DROPPED"
    tinyint score "CHECK <= 100"
    decimal hours_played "single source of truth (fixes H2)"
    boolean is_favorite
    boolean is_installed
    smallint achievements_unlocked
    text notes
    datetime last_played_at "UTC; NULL = never played"
    datetime updated_at "ON UPDATE CURRENT_TIMESTAMP"
  }
  REVIEWS {
    int user_id PK,FK "(user_id, game_id) → user_games, CASCADE"
    varchar game_id PK,FK
    text body "CHECK 1..5000 chars after trim"
    datetime created_at
    datetime updated_at
  }
```

`average_score`, `popularity` and `review_count` are not stored. The `game_stats` view computes them from `user_games` and `reviews`. The `game_catalog` view joins `games` to company names, and `GET /api/games` reads it.

## 4. Example flow: saving a tracking entry

```mermaid
sequenceDiagram
  actor U as User
  participant M as TrackingModal
  participant A as App.tsx
  participant API as shared/api/api.ts
  participant S as Express
  participant P as MySQL

  U->>M: set status, score, hours → Save
  M->>A: onSave(entry)
  A->>API: saveUserGame(userGame)
  API->>S: PATCH /api/me/games/:gameId
  S->>P: INSERT … AS new ON DUPLICATE KEY UPDATE status = new.status, …
  P-->>S: OK (CHECK and ENUM enforced)
  S->>P: SELECT the row back (MySQL has no RETURNING)
  P-->>S: row
  S-->>API: 200 + UserGame JSON (0/1 → boolean, snake_case → camelCase)
  API-->>A: UserGame
  A->>A: replace entry in state
  Note over A,M: Cards, list and detail all read hours from the same UserGame record, so they update together.
```

On error (for example, a score above 100 rejected by the CHECK constraint, MySQL error 3819), the API returns 400, `api.ts` throws, and the modal stays open showing the message. No data is lost.

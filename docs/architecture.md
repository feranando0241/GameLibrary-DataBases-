# Geekbond Target Architecture

Target state after phase 3 of the [architecture review](architecture-review.md) roadmap. Decisions behind it: [ADR-0001](adr/0001-database-and-data-access-layer.md).

## 1. System layers

Each layer may only call the layer directly below it. The arrow from `api.ts` is the only place where the UI touches data, so swapping mocks for the real API changes one file.

```mermaid
flowchart TB
  subgraph Browser["Browser · React SPA (Vite)"]
    direction TB
    UI["components/<br/>layout · discover · library · media-detail · tracker · ui<br/><i>render only, typed props</i>"]
    APP["App.tsx<br/><i>view state: selected game, view mode, open modal</i>"]
    LIB["lib/ (pure functions, unit-tested)<br/>filters.ts · collections.ts · status.ts"]
    API["lib/api.ts<br/><i>the single data seam</i><br/>getGames · getLibrary · saveUserGame"]
    MOCK[("data/<br/>mockGames · mockLibrary<br/><i>until phase 3</i>")]
    UI --> APP
    APP --> LIB
    APP --> API
    API -. "phase 2" .-> MOCK
  end

  subgraph Server["API server · Node + Express (server/)"]
    direction TB
    ROUTES["Routes<br/>GET /api/games<br/>GET /api/me/games<br/>PUT /api/me/games/:gameId"]
    SQL["Hand-written SQL via mysql2 pool<br/><i>execute() with ? placeholders only</i><br/>credentials from .env"]
    ROUTES --> SQL
  end

  subgraph DB["MySQL 8 · InnoDB · utf8mb4"]
    direction TB
    TABLES[("users · games · genres<br/>game_genres · user_games")]
    VIEW[["view: game_stats<br/>average_score · popularity"]]
    MIG["db/migrations/001_init.sql …<br/>db/seed.sql"]
    VIEW --> TABLES
    MIG -. "applied in order" .-> TABLES
  end

  API -- "phase 3: fetch('/api/…') JSON<br/>(Vite proxy in dev)" --> ROUTES
  SQL --> TABLES
  SQL --> VIEW
```

**Dependency rules**
- `components/` never import from `data/` or `api.ts`. They get everything through props.
- `lib/` has no React and no I/O, so it can be tested in isolation.
- Only `server/` knows SQL, and only `db/migrations/` changes the schema.

## 2. Data model

```mermaid
erDiagram
  USERS ||--o{ USER_GAMES : tracks
  GAMES ||--o{ USER_GAMES : "tracked by"
  GAMES ||--o{ GAME_GENRES : has
  GENRES ||--o{ GAME_GENRES : groups

  USERS {
    int id PK "AUTO_INCREMENT"
    varchar username UK
    datetime created_at
  }
  GAMES {
    varchar id PK "slug, e.g. elden-ring"
    varchar title
    varchar developer
    varchar publisher
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
```

`average_score` and `popularity` are not stored. The `game_stats` view computes them from `user_games`.

## 3. Example flow: saving a tracking entry

```mermaid
sequenceDiagram
  actor U as User
  participant M as TrackingModal
  participant A as App.tsx
  participant API as lib/api.ts
  participant S as Express
  participant P as MySQL

  U->>M: set status, score, hours → Save
  M->>A: onSave(entry)
  A->>API: saveUserGame(userGame)
  API->>S: PUT /api/me/games/:gameId
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

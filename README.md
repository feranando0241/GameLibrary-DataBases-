# Geekbond

A personal video game library and play tracker. Browse a catalog, filter it, and keep track of what you're playing, what you've finished, and what's next.

Built for the Databases course at the University of Louisville, Fall 2026.

> **Project status:** the frontend works, but it still runs on mock data, so changes are lost when you reload. The MySQL schema is written and tested. The backend API that connects them isn't built yet. See [Roadmap](#roadmap).

## Features

- **Poster wall and table views** of the catalog, with search (`⌘K` / `Ctrl+K`).
- **Filters and sorting** by genre, release year, platform, and tracking status, sorted by score, hours played, popularity, title, or release date.
- **Tracking** for each game: status, your score out of 100, hours played, and notes.
- **Five statuses**, each shown with a color, an icon, and a label, so none of them depends on color alone: Playing, Plan to Play, Completed, On Hold, and Dropped.
- **My Games and Favorites**, plus genre collections in the sidebar.
- **Game detail pages** with stats, a summary, and genres.
- **Accessibility:** keyboard navigation, screen reader labels, a native `<dialog>` for the tracking form, text contrast above 4.5:1, and support for the system's reduced motion setting.
- **Responsive layout**, from phone to desktop.

The downloads popover and the user profile in the top bar are placeholders with fixed sample data.

## Tech stack

| Layer | Technology | Status |
|-------|------------|--------|
| UI | React 19, TypeScript, Tailwind CSS 3, Phosphor Icons | Working |
| Build and dev server | Vite 8 | Working |
| Linting and tests | oxlint, Node's built-in test runner | Working |
| Database | MySQL 8.0.19+ with hand-written SQL | Schema ready |
| API | Node, Express, `mysql2` | Planned |

We write the SQL by hand instead of using an ORM because the schema and queries are the core of this course project. [ADR-0001](docs/adr/0001-database-and-data-access-layer.md) explains that decision.

## Getting started

**You need:** Node.js 22.18 or later. MySQL is optional for now; only the database tests use it.

```bash
git clone https://github.com/juandcq2006/GameLibrary-DataBases-.git
cd GameLibrary-DataBases-
npm install
npm run dev
```

Vite prints the local URL, usually <http://localhost:5173>.

### Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the dev server |
| `npm run build` | Type-checks and builds for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs oxlint |
| `npm test` | Runs all the tests |

### Database (optional)

Apply the schema to a local MySQL server:

```bash
mysql -u root -e "CREATE DATABASE geekbond"
mysql -u root geekbond < database/migrations/001_init.sql
```

The app doesn't connect to this database yet, and there's no seed data yet, so the tables start empty.

## Project structure

```
frontend/      React app
  src/app/       App shell: state and page composition
  src/features/  library, game-detail, tracking
  src/shared/    api (the data layer), domain types, UI components
backend/       Express API (planned; only a README for now)
database/      MySQL migrations
tests/         All tests, one folder per module
docs/          Architecture, decision records, and the review
```

### How data flows

Today, `frontend/src/shared/api/api.ts` reads from mock data. It is the only frontend file that knows where data comes from:

```
React components  →  shared/api/api.ts  →  mock data (today)
                                        →  Express API  →  MySQL (next)
```

When the backend is ready, only that file has to change. Tests in `tests/architecture/` enforce this boundary and the other import rules, so a violation fails `npm test`.

### Data model

| Table | Holds |
|-------|-------|
| `users` | User accounts |
| `games` | The catalog: title, developer, year, platform, and so on |
| `genres`, `game_genres` | Genres and the many-to-many link to games |
| `user_games` | One user's data for one game: status, score, hours, favorite, notes |
| `game_stats` (view) | Average score and popularity, computed from `user_games` |

The full diagram is in [docs/architecture.md](docs/architecture.md#3-data-model).

## Testing

`npm test` covers:

- the data layer's contract
- filters and sorting
- module boundaries
- checks that no credentials get committed
- the database schema: constraints, upserts, cascades, and the `game_stats` view

The database tests skip themselves if MySQL isn't reachable. They take their connection settings from `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD`. More detail is in [tests/README.md](tests/README.md).

## Roadmap

- [x] Frontend UI with mock data
- [x] Data layer that separates the UI from the data source
- [x] Unit, architecture, and security tests
- [x] MySQL schema and migration tests
- [ ] Seed data generated from the mocks
- [ ] Express API: `GET /api/games`, `GET /api/me/games`, `PATCH /api/me/games/:gameId`
- [ ] Connect the frontend to the API, so changes persist
- [ ] Continuous integration
- [ ] Server-side filtering, a URL for each view, and user accounts

## Documentation

- [Architecture](docs/architecture.md): target design, module rules, and diagrams
- [ADR-0001](docs/adr/0001-database-and-data-access-layer.md): why MySQL, Express, and hand-written SQL
- [Architecture review](docs/architecture-review.md): findings and the phased plan
- [Backend rules](backend/README.md), [database rules](database/README.md), and [testing conventions](tests/README.md)

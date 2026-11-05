# backend/

The Geekbond HTTP API: Node + Express + `mysql2`, hand-written SQL (see [ADR-0001](../docs/adr/0001-database-and-data-access-layer.md)).

## Layout

```
backend/
├── index.ts        ← Express app: JSON, routes, error handler, listen()
├── db.ts           ← mysql2 pool from env vars (decimalNumbers: true, dateStrings: true)
├── map.ts          ← row → wire mapping: snake_case → camelCase, 0/1 → boolean, DATETIME → ISO UTC
├── types.ts        ← the HTTP contract (mirrors frontend/src/shared/domain/game.ts)
├── http-error.ts   ← errors that carry an HTTP status
└── routes/
    ├── games.ts    ← GET /api/games
    └── me-games.ts ← GET /api/me/games, PATCH /api/me/games/:gameId
```

## Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/api/games` | — | `Game[]` (genres + `game_stats` columns) |
| `GET` | `/api/me/games` | — | `{ [gameId]: UserGame }` |
| `PATCH` | `/api/me/games/:gameId` | `Partial<UserGame>` | `UserGame` as stored |

`PATCH` merges only the fields present in the body. `gameId` and `updatedAt` are server-owned and ignored.
Errors use one shape: `{ "error": "message" }` — `400` for values the schema rejects, `404` for an unknown game, `500` otherwise.

Authentication is out of scope for now: every request is the demo user (`user_id = 1`, from `database/seeds/`).

## Run

```bash
cp backend/.env.example backend/.env   # fill in the real values; backend/.env is git-ignored
npm run api                            # http://localhost:3000
npm run typecheck:backend
node --test "tests/backend/**/*.test.ts"
```

## Rules

- **One endpoint per function in `frontend/src/shared/api/api.ts`.** That file and `tests/frontend/api/` define the contract.
- **SQL only through `pool.execute()` / `pool.query()` with `?` placeholders.** Never build SQL by concatenating request values.
- **Credentials only from environment variables** (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), loaded from a git-ignored `.env`. Commit only `.env.example` with empty secret values. `tests/security/` enforces this.
- **Never import from `frontend/`.** The two sides share only the HTTP contract. `tests/architecture/` enforces this.
- **The schema is owned by `database/migrations/`**, not by this code.
- Tests go in `tests/backend/`.

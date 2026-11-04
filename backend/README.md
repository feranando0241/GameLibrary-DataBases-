# backend/

The Geekbond HTTP API: Node + Express + `mysql2`, hand-written SQL (see [ADR-0001](../docs/adr/0001-database-and-data-access-layer.md)). It is built in phase 3; this folder is reserved for it.

## Planned layout

```
backend/
├── index.ts          ← Express app: JSON, routes, error handler, listen()
├── db.ts             ← mysql2 pool from env vars (decimalNumbers: true)
└── routes/
    ├── games.ts      ← GET /api/games
    └── me-games.ts   ← GET /api/me/games, PATCH /api/me/games/:gameId
```

## Rules

- **One endpoint per function in `frontend/src/shared/api/api.ts`.** That file and `tests/frontend/api/` define the contract.
- **SQL only through `pool.execute()` with `?` placeholders.** Never build SQL by concatenating request values.
- **Credentials only from environment variables** (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), loaded from a git-ignored `.env`. Commit only `.env.example` with empty secret values. `tests/security/` enforces this.
- **Never import from `frontend/`.** The two sides share only the HTTP contract. `tests/architecture/` enforces this.
- **The schema is owned by `database/migrations/`**, not by this code.
- Tests go in `tests/backend/`.

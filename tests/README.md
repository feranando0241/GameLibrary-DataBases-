# tests/

All tests live here, one folder per module. Nothing test-related goes inside `frontend/`, `backend/` or `database/`.

| Folder | What it checks | Needs |
|--------|----------------|-------|
| `frontend/api/` | Data-access contract of `frontend/src/shared/api/api.ts`. The real API must keep passing it. | – |
| `frontend/filters/` | Library filtering, sorting, collections and badge counts | – |
| `frontend/fixtures.ts` | Small shared test data for the frontend tests | – |
| `database/` | Migrations apply in order; constraints, upsert, cascade and `game_stats` behave as the app expects | MySQL (skips without it) |
| `backend/` | API endpoints (phase 3) | – |
| `architecture/` | Module boundaries: what may import what | – |
| `security/` | No credentials, keys, env files or personal emails get published; no server secrets in the browser bundle | git |

Run everything with `npm test`, or one folder with, for example, `node --test "tests/database/**/*.test.ts"`.

Conventions:
- Node's built-in runner (`node:test`), no test framework.
- Type-checked by `tsconfig.test.json` as part of `tsc -b`.
- Imports into app code use explicit `.ts` extensions so Node can run them directly.

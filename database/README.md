# database/

MySQL schema for Geekbond. MySQL 8.0.19+ is required, with InnoDB, utf8mb4 and strict `sql_mode` (see [ADR-0001](../docs/adr/0001-database-and-data-access-layer.md)).

```
database/
└── migrations/
    └── 001_init.sql   ← users, games, genres, game_genres, user_games, view game_stats
```

A `seeds/` folder (demo data generated from the frontend mocks) arrives in phase 3.

## Rules

- **Migrations are numbered `NNN_description.sql` and applied in order.** Never edit one that has been applied anywhere; add the next number instead.
- **Validation lives in the schema** (`CHECK`, `ENUM`, foreign keys), so bad data is rejected no matter which code writes it.
- **No real data or credentials in this folder.** `tests/security/` fails on database files (`.sqlite`, `.db`) and on passwords.

## Apply locally

```bash
mysql -u root -e "CREATE DATABASE geekbond"
mysql -u root geekbond < database/migrations/001_init.sql
```

## Tests

`tests/database/` applies every migration to a throwaway database, checks the constraints the app relies on, then drops it. The tests skip themselves when MySQL isn't reachable. Connection settings come from `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD`.

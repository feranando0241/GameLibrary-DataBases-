// GET /api/me/games and PATCH /api/me/games/:gameId — one endpoint per function in api.ts.
import { Router } from 'express';
import { pool } from '../db.ts';
import { HttpError } from '../http-error.ts';
import { toSqlDateTime, toUserGame, type UserGameRow } from '../map.ts';
import { TRACKING_STATUSES, type Library, type UserGame } from '../types.ts';

export const meGamesRouter: Router = Router();

/** Authentication is a later ADR; every request is the demo user for now. */
const DEMO_USER_ID = 1;

const COLUMN = {
  status: 'status',
  score: 'score',
  hoursPlayed: 'hours_played',
  isFavorite: 'is_favorite',
  isInstalled: 'is_installed',
  achievementsUnlocked: 'achievements_unlocked',
  notes: 'notes',
  lastPlayedAt: 'last_played_at',
} as const;

type WritableKey = keyof typeof COLUMN;

type SqlValue = string | number | null;

const SELECT_ROW = `
  SELECT game_id, status, score, hours_played, is_favorite, is_installed,
         achievements_unlocked, notes, last_played_at, updated_at
    FROM user_games
   WHERE user_id = ? AND game_id = ?
`;

/** Column defaults of `user_games`, mirroring `newUserGame` in api.ts. */
function defaults(gameId: string): UserGame {
  return {
    gameId,
    status: null,
    score: null,
    hoursPlayed: 0,
    isFavorite: false,
    isInstalled: false,
    achievementsUnlocked: 0,
    notes: null,
    lastPlayedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

/** Validates one writable field and converts it to the value the driver should send. */
function sqlValue(key: WritableKey, value: unknown): SqlValue {
  switch (key) {
    case 'status':
      if (value === null) return null;
      if (typeof value === 'string' && (TRACKING_STATUSES as readonly string[]).includes(value)) return value;
      return badRequest(`status must be one of ${TRACKING_STATUSES.join(', ')} or null`);

    case 'score':
      if (value === null) return null;
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100) return value;
      return badRequest('score must be an integer between 0 and 100, or null');

    case 'hoursPlayed':
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
      return badRequest('hoursPlayed must be a non-negative number');

    case 'isFavorite':
    case 'isInstalled':
      if (typeof value === 'boolean') return value ? 1 : 0;
      return badRequest(`${key} must be a boolean`);

    case 'achievementsUnlocked':
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
      return badRequest('achievementsUnlocked must be a non-negative integer');

    case 'notes':
      if (value === null || typeof value === 'string') return value;
      return badRequest('notes must be a string or null');

    case 'lastPlayedAt':
      if (value === null) return null;
      if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return toSqlDateTime(value);
      return badRequest('lastPlayedAt must be an ISO 8601 date-time or null');

    default:
      return badRequest(`field is not editable: ${String(key)}`);
  }
}

function badRequest(message: string): never {
  throw new HttpError(400, message);
}

/** Only the fields present in the body change; `gameId` and `updatedAt` are ignored. */
function readChanges(body: unknown): { column: string; value: SqlValue }[] {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'body must be a JSON object');
  }

  const record = body as Record<string, unknown>;
  const changes: { column: string; value: SqlValue }[] = [];

  for (const key of Object.keys(COLUMN) as WritableKey[]) {
    if (Object.hasOwn(record, key)) {
      changes.push({ column: COLUMN[key], value: sqlValue(key, record[key]) });
    }
  }

  return changes;
}

async function selectRow(gameId: string): Promise<UserGame | null> {
  const [rows] = await pool.query(SELECT_ROW, [DEMO_USER_ID, gameId]);
  const row = (rows as UserGameRow[])[0];
  return row === undefined ? null : toUserGame(row);
}

meGamesRouter.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT game_id, status, score, hours_played, is_favorite, is_installed,
            achievements_unlocked, notes, last_played_at, updated_at
       FROM user_games
      WHERE user_id = ?
      ORDER BY game_id`,
    [DEMO_USER_ID]
  );

  const library: Library = {};
  for (const row of rows as UserGameRow[]) library[row.game_id] = toUserGame(row);
  res.json(library);
});

meGamesRouter.patch('/:gameId', async (req, res) => {
  const gameId = req.params.gameId;

  const [games] = await pool.query('SELECT id FROM games WHERE id = ?', [gameId]);
  if ((games as unknown[]).length === 0) throw new HttpError(404, `game not found: ${gameId}`);

  const changes = readChanges(req.body);

  if (changes.length === 0) {
    res.json((await selectRow(gameId)) ?? defaults(gameId));
    return;
  }

  const columns = changes.map((change) => change.column);
  const values = changes.map((change) => change.value);
  const updates = columns.map((column) => `${column} = new.${column}`).join(', ');

  // MySQL has no RETURNING: upsert, then read the row back (ADR-0001).
  await pool.execute(
    `INSERT INTO user_games (user_id, game_id, ${columns.join(', ')})
     VALUES (?, ?, ${columns.map(() => '?').join(', ')}) AS new
     ON DUPLICATE KEY UPDATE ${updates}, updated_at = CURRENT_TIMESTAMP`,
    [DEMO_USER_ID, gameId, ...values]
  );

  const saved = await selectRow(gameId);
  if (saved === null) throw new HttpError(500, 'row disappeared after it was written');
  res.json(saved);
});

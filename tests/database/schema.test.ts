// Applies database/migrations/*.sql to a throwaway MySQL database and checks the constraints the app relies on.
// Uses the `mysql` CLI (no extra dependency). Skips when MySQL isn't reachable, e.g. on a machine without it.
// Connection: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD (defaults: localhost, 3306, root, no password).
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'database', 'migrations');
const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '' } = process.env;
// Password goes through the environment, never the command line (visible in `ps`)
const env = { ...process.env, MYSQL_PWD: DB_PASSWORD };
const DB = `geekbond_test_${process.pid}_${Date.now()}`;

/** Runs SQL and returns tab-separated rows. Throws with MySQL's message on error. */
const sql = (query: string, database: string | null = DB) =>
  execFileSync(
    'mysql',
    ['-h', DB_HOST, '-P', DB_PORT, '-u', DB_USER, '--batch', '--skip-column-names', ...(database ? [database] : [])],
    { env, input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim();

const rejects = (query: string, message: RegExp) =>
  assert.throws(() => sql(query), (e: { stderr?: string }) => message.test(e.stderr ?? ''));

let skip: string | false = false;
try {
  sql('SELECT 1', null);
} catch {
  skip = `MySQL not reachable at ${DB_USER}@${DB_HOST}:${DB_PORT}`;
}

const migrations = readdirSync(migrationsDir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();

before(() => {
  if (skip) return;
  sql(`CREATE DATABASE \`${DB}\``, null);
  for (const file of migrations) sql(readFileSync(join(migrationsDir, file), 'utf8'));
  sql(`
    INSERT INTO users (username) VALUES ('demo');
    INSERT INTO games (id, title, developer, publisher, release_year, format)
    VALUES ('g1', 'Game One', 'Dev', 'Pub', 2023, 'PC'), ('g2', 'Game Two', 'Dev', 'Pub', 2024, 'Steam Deck');
  `);
});

after(() => {
  if (!skip) sql(`DROP DATABASE IF EXISTS \`${DB}\``, null);
});

test('migrations are numbered and apply cleanly in order', { skip }, () => {
  assert.ok(migrations.length > 0, 'no migrations found');
  migrations.forEach((f, i) => assert.ok(f.startsWith(String(i + 1).padStart(3, '0')), `gap or duplicate before ${f}`));
});

test('every table and view the app uses exists', { skip }, () => {
  const tables = sql('SHOW TABLES').split('\n').sort();
  assert.deepEqual(tables, ['game_genres', 'game_stats', 'games', 'genres', 'user_games', 'users']);
});

test('upsert (the PATCH /api/me/games/:gameId query) inserts, then updates the same row', { skip }, () => {
  const upsert = (status: string, hours: number) =>
    sql(`INSERT INTO user_games (user_id, game_id, status, hours_played) VALUES (1, 'g1', '${status}', ${hours})
         AS new ON DUPLICATE KEY UPDATE status = new.status, hours_played = new.hours_played`);
  upsert('CURRENT', 10);
  upsert('COMPLETED', 42.5);
  assert.equal(sql(`SELECT COUNT(*), status, hours_played FROM user_games WHERE game_id = 'g1' GROUP BY status, hours_played`), '1\tCOMPLETED\t42.5');
});

test('constraints reject invalid data instead of storing it', { skip }, () => {
  rejects(`INSERT INTO user_games (user_id, game_id, score) VALUES (1, 'g2', 150)`, /Check constraint/i);
  rejects(`INSERT INTO user_games (user_id, game_id, hours_played) VALUES (1, 'g2', -1)`, /Check constraint|Out of range/i);
  rejects(`INSERT INTO user_games (user_id, game_id, status) VALUES (1, 'g2', 'BOGUS')`, /Data truncated|Incorrect/i);
  rejects(`INSERT INTO games (id, title, developer, publisher, release_year, format) VALUES ('x', 't', 'd', 'p', 2020, 'Atari')`, /Data truncated|Incorrect/i);
  rejects(`INSERT INTO user_games (user_id, game_id) VALUES (1, 'missing-game')`, /foreign key constraint/i);
});

test('game_stats derives average score and popularity from user ratings', { skip }, () => {
  sql(`INSERT INTO users (username) VALUES ('second');
       INSERT INTO user_games (user_id, game_id, score) VALUES (1, 'g2', 80), (2, 'g2', 91)`);
  assert.equal(sql(`SELECT average_score, popularity FROM game_stats WHERE game_id = 'g2'`), '86\t2');
});

test('deleting a game cascades to its user rows', { skip }, () => {
  sql(`DELETE FROM games WHERE id = 'g2'`);
  assert.equal(sql(`SELECT COUNT(*) FROM user_games WHERE game_id = 'g2'`), '0');
});

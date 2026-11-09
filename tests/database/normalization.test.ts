// Migration 002 (companies, platforms, reviews, accounts), the seeds and database/queries.sql, on throwaway
// MySQL databases. Same connection settings and skip rule as schema.test.ts.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toSeedGame, toSeedSql, type RawgGame, type SeedGame } from '../../database/rawg.ts';

const databaseDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'database');
const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '' } = process.env;
const env = { ...process.env, MYSQL_PWD: DB_PASSWORD };
const stamp = `${process.pid}_${Date.now()}`;
const LEGACY = `geekbond_test_legacy_${stamp}`; // 001 + old-style data, then 002 (the shared-database upgrade path)
const FRESH = `geekbond_test_fresh_${stamp}`; // every migration, then every seed

const sql = (database: string | null, query: string) =>
  execFileSync(
    'mysql',
    [
      '-h', DB_HOST, '-P', DB_PORT, '-u', DB_USER, '--batch', '--skip-column-names',
      '--default-character-set=utf8mb4', ...(database ? [database] : []),
    ],
    { env, input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().replace(/\r\n/g, '\n');

const rejects = (database: string, query: string, message: RegExp) =>
  assert.throws(() => sql(database, query), (e: { stderr?: string }) => message.test(e.stderr ?? ''));

const files = (dir: string) =>
  readdirSync(join(databaseDir, dir)).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
const read = (dir: string, file: string) => readFileSync(join(databaseDir, dir, file), 'utf8');

let skip: string | false = false;
try {
  sql(null, 'SELECT 1');
} catch {
  skip = `MySQL not reachable at ${DB_USER}@${DB_HOST}:${DB_PORT}`;
}

before(() => {
  if (skip) return;
  sql(null, `CREATE DATABASE \`${LEGACY}\`; CREATE DATABASE \`${FRESH}\``);

  sql(LEGACY, read('migrations', '001_init.sql'));
  sql(LEGACY, `
    INSERT INTO users (username) VALUES ('demo');
    INSERT INTO games (id, title, developer, publisher, release_year, format) VALUES
      ('w3', 'The Witcher 3', 'CD PROJEKT RED', 'CD PROJEKT RED', 2015, 'PC'),
      ('cp', 'Cyberpunk 2077', 'CD PROJEKT RED', 'CD PROJEKT RED', 2020, 'PC'),
      ('er', 'Elden Ring', 'FromSoftware', 'Bandai Namco', 2022, 'PlayStation 5');
    INSERT INTO user_games (user_id, game_id, status, score, hours_played) VALUES (1, 'er', 'COMPLETED', 98, 200);
  `);
  for (const file of files('migrations').slice(1)) sql(LEGACY, read('migrations', file));

  for (const file of files('migrations')) sql(FRESH, read('migrations', file));
  for (const file of files('seeds')) sql(FRESH, read('seeds', file));
});

after(() => {
  if (!skip) sql(null, `DROP DATABASE IF EXISTS \`${LEGACY}\`; DROP DATABASE IF EXISTS \`${FRESH}\``);
});

test('002 upgrades a database that already has data: companies are deduplicated and linked', { skip }, () => {
  assert.equal(sql(LEGACY, 'SELECT name FROM companies ORDER BY name'), 'Bandai Namco\nCD PROJEKT RED\nFromSoftware');
  assert.equal(
    sql(LEGACY, 'SELECT id, developer, publisher FROM game_catalog ORDER BY id'),
    'cp\tCD PROJEKT RED\tCD PROJEKT RED\ner\tFromSoftware\tBandai Namco\nw3\tCD PROJEKT RED\tCD PROJEKT RED'
  );
  assert.equal(sql(LEGACY, "SHOW COLUMNS FROM games LIKE 'developer'"), '', 'old text column is dropped');
});

test('002 keeps existing library rows and links each game to its own platform', { skip }, () => {
  assert.equal(sql(LEGACY, 'SELECT game_id, score, hours_played FROM user_games'), 'er\t98\t200.0');
  assert.equal(
    sql(LEGACY, 'SELECT gp.game_id, pl.name FROM game_platforms gp JOIN platforms pl ON pl.id = gp.platform_id ORDER BY gp.game_id'),
    'cp\tPC\ner\tPlayStation 5\nw3\tPC'
  );
});

test('a company that still has games cannot be deleted', { skip }, () => {
  rejects(LEGACY, "DELETE FROM companies WHERE name = 'FromSoftware'", /foreign key constraint/i);
});

test('seeds apply on top of every migration and can be re-run without duplicates', { skip }, () => {
  const counts = () => sql(FRESH, `SELECT (SELECT COUNT(*) FROM games), (SELECT COUNT(*) FROM companies),
    (SELECT COUNT(*) FROM reviews), (SELECT COUNT(*) FROM game_platforms), (SELECT COUNT(*) FROM users)`);
  const first = counts();
  for (const file of files('seeds')) sql(FRESH, read('seeds', file));
  assert.equal(counts(), first);
  assert.match(first, /^15\t20\t7\t15\t4$/);
});

test('reviews: one per user per game, only for games in that user\'s library, never empty', { skip }, () => {
  // user 4 has not added elden-ring to their library
  rejects(FRESH, "INSERT INTO reviews (user_id, game_id, body) VALUES (4, 'elden-ring', 'Great')", /foreign key constraint/i);
  rejects(FRESH, "INSERT INTO reviews (user_id, game_id, body) VALUES (4, 'stellaris', '   ')", /Check constraint/i);
  rejects(FRESH, "INSERT INTO reviews (user_id, game_id, body) VALUES (1, 'elden-ring', 'Second review')", /Duplicate entry/i);
});

test('game_stats counts reviews without inflating popularity', { skip }, () => {
  // elden-ring: 3 libraries (users 1, 2, 3) with scores 98, 95, 99 and 3 reviews
  assert.equal(sql(FRESH, "SELECT average_score, popularity, review_count FROM game_stats WHERE game_id = 'elden-ring'"), '97\t3\t3');
});

test('removing a game from a library removes that user\'s review of it', { skip }, () => {
  sql(FRESH, "DELETE FROM user_games WHERE user_id = 2 AND game_id = 'starfield'");
  assert.equal(sql(FRESH, "SELECT COUNT(*) FROM reviews WHERE user_id = 2 AND game_id = 'starfield'"), '0');
});

test('users: email is unique and must look like an address', { skip }, () => {
  rejects(FRESH, "INSERT INTO users (username, email) VALUES ('copycat', 'pam@example.com')", /Duplicate entry/i);
  rejects(FRESH, "INSERT INTO users (username, email) VALUES ('typo', 'not-an-email')", /Check constraint/i);
});

test('every example query in database/queries.sql runs', { skip }, () => {
  const out = sql(FRESH, readFileSync(join(databaseDir, 'queries.sql'), 'utf8'));
  assert.match(out, /Elden Ring: Shadow of the Erdtree/);
});

test('a RAWG seed applies, reuses existing companies and genres, and links platforms', { skip }, () => {
  const raw: RawgGame[] = [
    {
      slug: 'portal-2',
      name: "Portal 2",
      released: '2011-04-18',
      background_image: 'https://media.rawg.io/media/games/portal2.jpg',
      description_raw: "Portal 2 draws from the award-winning formula of innovative gameplay, story, and music.",
      achievements_count: 51,
      platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'Xbox 360' } }, { platform: { name: 'PlayStation 3' } }],
      genres: [{ name: 'Shooter' }, { name: 'Puzzle' }],
      developers: [{ name: 'Valve Software' }],
      publishers: [{ name: 'Valve' }],
    },
    {
      slug: 'cyberpunk-2077', // already in 001_seed: updated in place, library rows keep pointing at it
      name: 'Cyberpunk 2077',
      released: '2020-12-10',
      background_image: null,
      platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'Xbox Series S/X' } }],
      genres: [{ name: 'RPG' }],
      developers: [{ name: 'CD PROJEKT RED' }],
      publishers: [],
    },
  ];
  const seed = toSeedSql(raw.map(toSeedGame) as SeedGame[]);
  sql(FRESH, seed);
  sql(FRESH, seed); // idempotent

  assert.equal(sql(FRESH, "SELECT title, developer, publisher, release_year FROM game_catalog WHERE id = 'portal-2'"), 'Portal 2\tValve Software\tValve\t2011');
  assert.equal(sql(FRESH, "SELECT COUNT(*) FROM companies WHERE name = 'CD PROJEKT RED'"), '1');
  assert.equal(sql(FRESH, "SELECT title FROM games WHERE id = 'cyberpunk-2077'"), 'Cyberpunk 2077');
  assert.equal(sql(FRESH, "SELECT COUNT(*) FROM user_games WHERE game_id = 'cyberpunk-2077'"), '1');
  assert.equal(
    sql(FRESH, `SELECT GROUP_CONCAT(pl.name ORDER BY pl.name) FROM game_platforms gp
                JOIN platforms pl ON pl.id = gp.platform_id WHERE gp.game_id = 'portal-2'`),
    'PC,PlayStation 3,Xbox 360'
  );
  assert.equal(
    sql(FRESH, `SELECT GROUP_CONCAT(ge.name ORDER BY ge.name) FROM game_genres gg
                JOIN genres ge ON ge.id = gg.genre_id WHERE gg.game_id = 'portal-2'`),
    'Puzzle,Shooter'
  );
});

// Applies migrations and seeds to the database named in backend/.env (the shared group database).
//
//   npm run db:status    which server, user and database you are connected to, and what is applied
//   npm run db:migrate   applies every migration not yet recorded in schema_migrations, in order
//   npm run db:seed      runs every file in database/seeds/ (they are idempotent, safe to re-run)
//
// Connection: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, the same variables the API uses.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection, type Connection, type RowDataPacket } from 'mysql2/promise';

const here = fileURLToPath(new URL('.', import.meta.url));
const MIGRATIONS = join(here, 'migrations');
const SEEDS = join(here, 'seeds');

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(join(here, '..', 'backend', '.env'));
  } catch {
    // No backend/.env: use the process environment.
  }
}

const { DB_HOST = '127.0.0.1', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = '' } = process.env;

/** If a database was set up by hand before this tool existed, these tables prove a migration ran. */
const APPLIED_IF_TABLE_EXISTS: Record<string, string> = {
  '001_init.sql': 'users',
  '002_normalization.sql': 'companies',
};

const sqlFiles = (dir: string) =>
  readdirSync(dir)
    .filter((f) => /^\d{3}_.+\.sql$/.test(f))
    .sort();

/** With DB_NAME empty, only `status` may run: it lists the databases this account can open. */
async function connect(allowNoDatabase = false): Promise<Connection> {
  if (!DB_NAME && !allowNoDatabase) {
    console.error('DB_NAME is empty. Run `npm run db:status` to list your databases, then set DB_NAME in backend/.env.');
    process.exit(1);
  }
  return createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME || undefined,
    multipleStatements: true, // migration files hold many statements
    charset: 'utf8mb4',
  });
}

async function rows<T>(db: Connection, sql: string, params: unknown[] = []): Promise<T[]> {
  const [result] = await db.query<RowDataPacket[]>(sql, params);
  return result as T[];
}

async function tableExists(db: Connection, name: string): Promise<boolean> {
  const found = await rows(db, 'SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?', [name]);
  return found.length > 0;
}

/** Creates the bookkeeping table and records migrations that were applied by hand earlier. */
async function appliedMigrations(db: Connection): Promise<Set<string>> {
  if (!(await tableExists(db, 'schema_migrations'))) {
    await db.query(`CREATE TABLE schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    for (const [file, table] of Object.entries(APPLIED_IF_TABLE_EXISTS)) {
      if (await tableExists(db, table)) {
        await db.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
        console.log(`  ${file} was already applied by hand (table ${table} exists), recorded it`);
      }
    }
  }
  const done = await rows<{ filename: string }>(db, 'SELECT filename FROM schema_migrations');
  return new Set(done.map((r) => r.filename));
}

async function migrate(db: Connection) {
  const applied = await appliedMigrations(db);
  const pending = sqlFiles(MIGRATIONS).filter((f) => !applied.has(f));
  if (pending.length === 0) return console.log('Nothing to migrate: the database is up to date.');

  for (const file of pending) {
    process.stdout.write(`  applying ${file} … `);
    try {
      await db.query(readFileSync(join(MIGRATIONS, file), 'utf8'));
    } catch (error) {
      console.log('FAILED');
      // MySQL DDL is not transactional: tell the team before anyone retries on the shared database.
      console.error(`\n${file} stopped part-way: ${(error as Error).message}`);
      console.error('Earlier statements in that file may already be applied. Run `npm run db:status` and tell the team.');
      process.exit(1);
    }
    await db.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
    console.log('ok');
  }
}

async function seed(db: Connection) {
  for (const file of sqlFiles(SEEDS)) {
    process.stdout.write(`  seeding ${file} … `);
    await db.query(readFileSync(join(SEEDS, file), 'utf8'));
    console.log('ok');
  }
}

async function status(db: Connection) {
  const [info] = await rows<{ db: string; user: string; version: string }>(
    db,
    'SELECT DATABASE() AS db, CURRENT_USER() AS user, VERSION() AS version'
  );
  console.log(`Server:   ${DB_HOST}:${DB_PORT} (MySQL ${info.version})`);
  console.log(`User:     ${info.user}`);

  if (!info.db) {
    const dbs = await rows<{ name: string }>(
      db,
      `SELECT schema_name AS name FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
        ORDER BY schema_name`
    );
    console.log('\nDB_NAME is empty. Databases this account can open:');
    for (const d of dbs) console.log(`  ${d.name}`);
    if (dbs.length === 0) console.log('  (none: ask the instructor to check your group access)');
    console.log('\nPut your group database (group name or group name-01) in DB_NAME in backend/.env, then run this again.');
    return;
  }
  console.log(`Database: ${info.db}   ← must be your group name or group name-01, the same for every teammate`);

  const applied = (await tableExists(db, 'schema_migrations'))
    ? new Set((await rows<{ filename: string }>(db, 'SELECT filename FROM schema_migrations')).map((r) => r.filename))
    : new Set<string>();
  console.log('\nMigrations:');
  for (const f of sqlFiles(MIGRATIONS)) console.log(`  [${applied.has(f) ? 'x' : ' '}] ${f}`);
  if (applied.size === 0) console.log('  (no schema_migrations table yet: run npm run db:migrate)');

  const tables = await rows<{ name: string; type: string }>(
    db,
    `SELECT table_name AS name, table_type AS type FROM information_schema.tables
      WHERE table_schema = DATABASE() ORDER BY table_name`
  );
  console.log('\nTables:');
  for (const t of tables) {
    if (t.type === 'VIEW') {
      console.log(`  ${t.name.padEnd(20)} (view)`);
      continue;
    }
    const [{ n }] = await rows<{ n: number }>(db, `SELECT COUNT(*) AS n FROM \`${t.name.replace(/`/g, '``')}\``);
    console.log(`  ${t.name.padEnd(20)} ${n} rows`);
  }
}

const commands: Record<string, (db: Connection) => Promise<void>> = { migrate, seed, status };
const command = commands[process.argv[2] ?? ''];
if (!command) {
  console.error('Usage: node database/cli.ts <status|migrate|seed>');
  process.exit(1);
}

let db: Connection;
try {
  db = await connect(command === status);
} catch (error) {
  const { code, message } = error as { code?: string; message: string };
  console.error(`Could not connect to ${DB_USER}@${DB_HOST}:${DB_PORT}: ${message}`);
  if (code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER and DB_PASSWORD in backend/.env.');
  if (code === 'ER_DBACCESS_DENIED_ERROR' || code === 'ER_BAD_DB_ERROR') {
    console.error('Check DB_NAME in backend/.env (empty it and run `npm run db:status` to list your databases).');
  }
  if (code === 'ER_USER_LIMIT_REACHED') {
    console.error('Your account allows 2 connections at once: close MySQL Workbench tabs and stop `npm run api`, then retry.');
  }
  if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    console.error('The server is unreachable from this network: try the campus network or the university VPN.');
  }
  process.exit(1);
}
try {
  await command(db);
} finally {
  await db.end();
}

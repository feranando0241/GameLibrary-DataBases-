// MySQL connection pool (ADR-0001). Credentials come only from the environment.
import { fileURLToPath } from 'node:url';
import { createPool, type Pool } from 'mysql2/promise';

// A git-ignored backend/.env is read when present; real environment variables win.
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)));
  } catch {
    // No .env file: rely on the process environment (tests, docker run -e …).
  }
}

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'geekbond',
} = process.env;

export const pool: Pool = createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  // The class server allows 2 connections per student account, so keep this low there (DB_CONNECTION_LIMIT=1).
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  // ADR-0001: DECIMAL arrives as a number, and DATETIME as text we format as ISO UTC ourselves.
  decimalNumbers: true,
  dateStrings: true,
  charset: 'utf8mb4',
});

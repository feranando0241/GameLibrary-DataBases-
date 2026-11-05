// Geekbond HTTP API: Express + mysql2, hand-written SQL (ADR-0001).
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { pathToFileURL } from 'node:url';
import { pool } from './db.ts';
import { HttpError } from './http-error.ts';
import { gamesRouter } from './routes/games.ts';
import { meGamesRouter } from './routes/me-games.ts';

/** mysql2 client errors caused by bad input (CHECK, ENUM, truncation) answer 400, not 500. */
const CLIENT_ERRORS = new Set([1265, 1292, 1366, 1406, 3819]);

const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const { errno, type } = err as { errno?: number; type?: string };
  if (type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido' });
    return;
  }

  if (errno !== undefined && CLIENT_ERRORS.has(errno)) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

export function createApp(): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/me/games', meGamesRouter);
  app.use('/api', gamesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createApp().listen(port, () => {
    console.log(`Geekbond API escuchando en http://localhost:${port}`);
  });

  // Close the HTTP server and drain the MySQL pool before exiting, so a restart
  // never leaves connections or in-flight writes half-done.
  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`\n${signal} recibido; cerrando el servidor…`);
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

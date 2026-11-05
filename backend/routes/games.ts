// GET /api/games — the catalog with genres and the computed game_stats columns.
import { Router } from 'express';
import { pool } from '../db.ts';
import { toGame, type GameRow } from '../map.ts';

export const gamesRouter: Router = Router();

const GAMES_SQL = `
  SELECT g.id,
         g.title,
         g.developer,
         g.publisher,
         g.release_year,
         g.format,
         COALESCE(g.cover_url, '')  AS cover_url,
         COALESCE(g.banner_url, '') AS banner_url,
         COALESCE(g.storage_gb, 0)  AS storage_gb,
         g.achievements_total,
         COALESCE(g.summary, '')    AS summary,
         (SELECT GROUP_CONCAT(ge.name ORDER BY ge.name SEPARATOR ',')
            FROM game_genres gg
            JOIN genres ge ON ge.id = gg.genre_id
           WHERE gg.game_id = g.id) AS genres,
         COALESCE(s.average_score, 0) AS average_score,
         COALESCE(s.popularity, 0)    AS popularity
    FROM games g
    LEFT JOIN game_stats s ON s.game_id = g.id
   ORDER BY g.title
`;

gamesRouter.get('/games', async (_req, res) => {
  const [rows] = await pool.query(GAMES_SQL);
  res.json((rows as GameRow[]).map(toGame));
});

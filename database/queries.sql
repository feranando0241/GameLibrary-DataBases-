-- Example queries for the demo and for the backend. Read-only: running this file changes nothing.
-- Run it in MySQL Workbench or with: mysql <group_db> < database/queries.sql
-- Inputs are session variables so the file runs as-is; in backend code, replace each @variable
-- with a ? placeholder and pass the value to pool.execute() (never build SQL from user input).

SET @user_id = 1;
SET @game_id = 'elden-ring';
SET @search  = 'ring';
SET @genre   = 'RPG';

-- 1. Catalog search: title, developer or publisher contains the text, with genres and platforms.
SELECT c.id, c.title, c.developer, c.publisher, c.release_year,
       (SELECT GROUP_CONCAT(ge.name ORDER BY ge.name SEPARATOR ', ')
          FROM game_genres gg JOIN genres ge ON ge.id = gg.genre_id
         WHERE gg.game_id = c.id) AS genres,
       (SELECT GROUP_CONCAT(pl.name ORDER BY pl.name SEPARATOR ', ')
          FROM game_platforms gp JOIN platforms pl ON pl.id = gp.platform_id
         WHERE gp.game_id = c.id) AS platforms
  FROM game_catalog c
 WHERE c.title LIKE CONCAT('%', @search, '%')
    OR c.developer LIKE CONCAT('%', @search, '%')
    OR c.publisher LIKE CONCAT('%', @search, '%')
 ORDER BY c.title;

-- 2. Every game in one genre, best average score first (many-to-many join + view).
SELECT c.title, c.developer, s.average_score, s.popularity, s.review_count
  FROM genres ge
  JOIN game_genres gg ON gg.genre_id = ge.id
  JOIN game_catalog c ON c.id = gg.game_id
  JOIN game_stats s   ON s.game_id = c.id
 WHERE ge.name = @genre
 ORDER BY s.average_score DESC, s.popularity DESC, c.title;

-- 3. Top 3 games in every genre (window function).
SELECT genre, title, average_score, genre_rank
  FROM (SELECT ge.name AS genre, c.title, s.average_score,
               RANK() OVER (PARTITION BY ge.id ORDER BY s.average_score DESC) AS genre_rank
          FROM genres ge
          JOIN game_genres gg ON gg.genre_id = ge.id
          JOIN game_catalog c ON c.id = gg.game_id
          JOIN game_stats s   ON s.game_id = c.id
         WHERE s.popularity > 0) ranked
 WHERE genre_rank <= 3
 ORDER BY genre, genre_rank, title;

-- 4. One user's collection, grouped by status, with totals (GROUP BY ... WITH ROLLUP).
SELECT CASE WHEN GROUPING(ug.status) = 1 THEN 'ALL'
            ELSE COALESCE(ug.status, 'NO STATUS') END AS status,
       COUNT(*)                         AS games,
       ROUND(SUM(ug.hours_played), 1)   AS total_hours,
       ROUND(AVG(ug.score))             AS avg_score
  FROM user_games ug
 WHERE ug.user_id = @user_id
 GROUP BY ug.status WITH ROLLUP;

-- 5. Reviews of one game, newest first, each with the reviewer's own score from their library.
SELECT u.username, ug.score, ug.status, r.body, r.created_at
  FROM reviews r
  JOIN users u       ON u.id = r.user_id
  JOIN user_games ug ON ug.user_id = r.user_id AND ug.game_id = r.game_id
 WHERE r.game_id = @game_id
 ORDER BY r.created_at DESC;

-- 6. Developer leaderboard: companies by the average user score of the games they developed.
SELECT co.name AS developer,
       COUNT(DISTINCT g.id)  AS games,
       ROUND(AVG(ug.score))  AS avg_user_score,
       COUNT(ug.score)       AS ratings
  FROM companies co
  JOIN games g            ON g.developer_id = co.id
  LEFT JOIN user_games ug ON ug.game_id = g.id
 GROUP BY co.id, co.name
HAVING COUNT(ug.score) > 0
 ORDER BY avg_user_score DESC, ratings DESC;

-- 7. Self-published games: developer and publisher are the same company (self-join on companies).
SELECT c.title, c.developer
  FROM game_catalog c
 WHERE c.developer_id = c.publisher_id
 ORDER BY c.title;

-- 8. Recommendations for a user: games not in their library that share a genre with games they
--    scored 90+, ranked by how many of those genres match (NOT EXISTS + aggregation).
SELECT c.title, COUNT(DISTINCT gg.genre_id) AS shared_genres, s.average_score
  FROM game_genres gg
  JOIN game_catalog c ON c.id = gg.game_id
  JOIN game_stats s   ON s.game_id = c.id
 WHERE gg.genre_id IN (SELECT gg2.genre_id
                         FROM user_games ug
                         JOIN game_genres gg2 ON gg2.game_id = ug.game_id
                        WHERE ug.user_id = @user_id AND ug.score >= 90)
   AND NOT EXISTS (SELECT 1 FROM user_games mine
                    WHERE mine.user_id = @user_id AND mine.game_id = c.id)
 GROUP BY c.id, c.title, s.average_score
 ORDER BY shared_genres DESC, s.average_score DESC
 LIMIT 10;

-- 9. Platforms by catalog size.
SELECT pl.name AS platform, COUNT(gp.game_id) AS games
  FROM platforms pl
  LEFT JOIN game_platforms gp ON gp.platform_id = pl.id
 GROUP BY pl.id, pl.name
 ORDER BY games DESC, platform;

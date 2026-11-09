-- 002: normalization pass on 001_init (Database Architect: Amit Sahoo).
--   1. developer/publisher become rows of `companies` (3NF: a company's name is stored once).
--   1b. `platforms` + `game_platforms`: the many-to-many list of platforms each game ships on.
--   2. `users` gets the columns account sign-up/login needs (email, password_hash).
--   3. `reviews`: public written reviews; the score stays in user_games (no duplicated rating).
--   4. Views: `game_catalog` (games with company names) and `game_stats` (+ review_count).
-- Works on an empty database and on one that already holds 001_seed data (it backfills).
-- Never edit this file once applied anywhere; add 003_*.sql instead.

-- MySQL Workbench turns on safe-update mode, which blocks the backfill UPDATE below.
SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- 1. Companies -----------------------------------------------------------------------------

CREATE TABLE companies (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(150) NOT NULL UNIQUE
);

-- One row per distinct name already in games (UNION removes duplicates such as
-- 'CD PROJEKT RED', which is both developer and publisher of its games).
INSERT INTO companies (name)
SELECT developer FROM games
UNION
SELECT publisher FROM games;

ALTER TABLE games
  ADD COLUMN developer_id INT UNSIGNED NULL AFTER title,
  ADD COLUMN publisher_id INT UNSIGNED NULL AFTER developer_id;

UPDATE games g
  JOIN companies d ON d.name = g.developer
  JOIN companies p ON p.name = g.publisher
   SET g.developer_id = d.id,
       g.publisher_id = p.id;

-- NOT NULL fails loudly here if any game was not matched to a company.
-- RESTRICT: a company cannot be deleted while a game still references it.
ALTER TABLE games
  MODIFY developer_id INT UNSIGNED NOT NULL,
  MODIFY publisher_id INT UNSIGNED NOT NULL,
  ADD INDEX idx_games_developer (developer_id),
  ADD INDEX idx_games_publisher (publisher_id),
  ADD CONSTRAINT fk_games_developer FOREIGN KEY (developer_id) REFERENCES companies(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_games_publisher FOREIGN KEY (publisher_id) REFERENCES companies(id) ON DELETE RESTRICT,
  DROP COLUMN developer,
  DROP COLUMN publisher;

-- 1b. Platforms ----------------------------------------------------------------------------

-- A game ships on many platforms and a platform has many games: many-to-many via game_platforms.
-- games.format stays as the single platform this library shows for the game (the frontend's
-- "format" filter); game_platforms holds the full list, e.g. imported from RAWG.
CREATE TABLE platforms (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE game_platforms (
  game_id      VARCHAR(100) NOT NULL,
  platform_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, platform_id),
  INDEX idx_game_platforms_platform (platform_id),
  FOREIGN KEY (game_id)     REFERENCES games(id)     ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Every game is at least on its own format.
INSERT INTO platforms (name)
SELECT DISTINCT format FROM games;

INSERT INTO game_platforms (game_id, platform_id)
SELECT g.id, pl.id
FROM games g
JOIN platforms pl ON pl.name = g.format;

-- 2. Accounts ------------------------------------------------------------------------------

-- Both NULL-able so the existing demo user stays valid until real sign-up exists.
-- password_hash holds a bcrypt/argon2 hash produced by the backend, never a plain password.
ALTER TABLE users
  ADD COLUMN email          VARCHAR(255) NULL AFTER username,
  ADD COLUMN password_hash  VARCHAR(255) NULL AFTER email,
  ADD CONSTRAINT uq_users_email UNIQUE (email),
  ADD CONSTRAINT chk_users_email CHECK (email IS NULL OR email LIKE '_%@_%._%');

-- 3. Reviews -------------------------------------------------------------------------------

-- One review per user per game. The composite foreign key points at user_games, so a user can
-- only review a game that is in their library, and the review shows the score from that row.
-- Removing the game from the library (or deleting the user or game) removes the review too.
CREATE TABLE reviews (
  user_id     INT UNSIGNED NOT NULL,
  game_id     VARCHAR(100) NOT NULL,
  body        TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, game_id),
  INDEX idx_reviews_game (game_id, created_at),
  CONSTRAINT chk_reviews_body CHECK (CHAR_LENGTH(TRIM(body)) BETWEEN 1 AND 5000),
  CONSTRAINT fk_reviews_user_game FOREIGN KEY (user_id, game_id)
    REFERENCES user_games(user_id, game_id) ON DELETE CASCADE
);

-- 4. Views ---------------------------------------------------------------------------------

-- The catalog as the API reads it: same column names as 001's games table, so queries that
-- selected g.developer / g.publisher keep working by reading this view instead.
CREATE VIEW game_catalog AS
SELECT g.id,
       g.title,
       d.name AS developer,
       p.name AS publisher,
       g.developer_id,
       g.publisher_id,
       g.release_year,
       g.format,
       g.cover_url,
       g.banner_url,
       g.storage_gb,
       g.achievements_total,
       g.summary
FROM games g
JOIN companies d ON d.id = g.developer_id
JOIN companies p ON p.id = g.publisher_id;

-- Same columns as before plus review_count. The review count is a subquery so the
-- user_games join is not multiplied by the number of reviews.
CREATE OR REPLACE VIEW game_stats AS
SELECT g.id                              AS game_id,
       COALESCE(ROUND(AVG(ug.score)), 0) AS average_score,
       COUNT(ug.user_id)                 AS popularity,
       (SELECT COUNT(*) FROM reviews r WHERE r.game_id = g.id) AS review_count
FROM games g
LEFT JOIN user_games ug ON ug.game_id = g.id
GROUP BY g.id;

SET SQL_SAFE_UPDATES = @old_safe_updates;

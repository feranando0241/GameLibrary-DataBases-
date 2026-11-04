-- 001_init: initial Geekbond schema (ADR-0001). MySQL 8.0.19+, InnoDB, utf8mb4, strict sql_mode.
-- Never edit this file once applied anywhere; add 002_*.sql instead.

CREATE TABLE users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id                  VARCHAR(100) PRIMARY KEY,   -- keeps current slugs ('elden-ring')
  title               VARCHAR(200) NOT NULL,
  developer           VARCHAR(150) NOT NULL,
  publisher           VARCHAR(150) NOT NULL,
  release_year        SMALLINT UNSIGNED NOT NULL,
  format              ENUM('PC','PlayStation 5','Xbox Series X','Nintendo Switch','Steam Deck') NOT NULL,
  cover_url           VARCHAR(500),
  banner_url          VARCHAR(500),
  storage_gb          DECIMAL(6,1),
  achievements_total  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  summary             TEXT,
  INDEX idx_games_release_year (release_year),
  INDEX idx_games_format (format)
);

CREATE TABLE genres (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE game_genres (
  game_id   VARCHAR(100) NOT NULL,
  genre_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, genre_id),
  INDEX idx_game_genres_genre (genre_id),
  FOREIGN KEY (game_id)  REFERENCES games(id)  ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- Merges today's UserTrackEntry with the per-user fields currently on Game
CREATE TABLE user_games (
  user_id                INT UNSIGNED NOT NULL,
  game_id                VARCHAR(100) NOT NULL,
  status                 ENUM('CURRENT','PLANNING','COMPLETED','PAUSED','DROPPED'),
  score                  TINYINT UNSIGNED CHECK (score <= 100),
  hours_played           DECIMAL(7,1) NOT NULL DEFAULT 0 CHECK (hours_played >= 0),
  is_favorite            BOOLEAN NOT NULL DEFAULT FALSE,
  is_installed           BOOLEAN NOT NULL DEFAULT FALSE,
  achievements_unlocked  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  notes                  TEXT,
  last_played_at         DATETIME NULL,              -- NULL = never played
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, game_id),
  INDEX idx_user_games_game (game_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- averageScore / popularity become derived values, not stored constants
CREATE VIEW game_stats AS
SELECT g.id                              AS game_id,
       COALESCE(ROUND(AVG(ug.score)), 0) AS average_score,
       COUNT(ug.user_id)                 AS popularity
FROM games g
LEFT JOIN user_games ug ON ug.game_id = g.id
GROUP BY g.id;

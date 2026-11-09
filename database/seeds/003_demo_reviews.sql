-- 003_demo_reviews: a few extra demo users with scores and written reviews, so reviews,
-- average_score and popularity have more than one user to work with. Only uses games from
-- 001_seed. Apply after migrations 001 and 002. Idempotent: re-running updates the same rows.
-- Emails use example.com (reserved for examples). password_hash stays NULL: these accounts
-- cannot log in; they exist to demo the data.

INSERT INTO users (id, username, email) VALUES
  (1, 'demo',      'demo@example.com'),
  (2, 'pixelpam',  'pam@example.com'),
  (3, 'speedrunsam', 'sam@example.com'),
  (4, 'cozycasey', 'casey@example.com') AS new
  ON DUPLICATE KEY UPDATE username = new.username, email = new.email;

-- A review needs the game in the reviewer's library (foreign key to user_games), and its score lives there.
INSERT INTO user_games (user_id, game_id, status, score, hours_played, is_favorite, last_played_at) VALUES
  (2, 'elden-ring',             'COMPLETED', 95, 160,   TRUE,  '2026-10-20 18:00:00'),
  (2, 'hades-2',                'CURRENT',   90, 41.5,  TRUE,  '2026-11-05 21:00:00'),
  (2, 'starfield',              'DROPPED',   55, 22,    FALSE, '2026-09-12 19:00:00'),
  (3, 'elden-ring',             'COMPLETED', 99, 412,   TRUE,  '2026-11-01 23:00:00'),
  (3, 'doom-eternal',           'COMPLETED', 93, 95,    TRUE,  '2026-10-02 22:00:00'),
  (3, 'dead-cells',             'CURRENT',   88, 130.2, FALSE, '2026-11-06 20:00:00'),
  (4, 'baldurs-gate-3',         'COMPLETED', 98, 205,   TRUE,  '2026-10-28 17:00:00'),
  (4, 'stellaris',              'PAUSED',    80, 66,    FALSE, '2026-08-30 16:00:00'),
  (4, 'hollow-knight-silksong', 'PLANNING',  NULL, 0,   TRUE,  NULL) AS new
  ON DUPLICATE KEY UPDATE status = new.status, score = new.score, hours_played = new.hours_played,
    is_favorite = new.is_favorite, last_played_at = new.last_played_at;

INSERT INTO reviews (user_id, game_id, body, created_at) VALUES
  (1, 'elden-ring',     'Shadow of the Erdtree is the best DLC I have played. Messmer alone is worth it.', '2026-11-01 21:00:00'),
  (1, 'witcher-3',      'Still the gold standard for side quests. Blood and Wine is a whole game on its own.', '2026-10-27 22:00:00'),
  (2, 'elden-ring',     'Hard but fair. Exploring without a quest log felt great once it clicked.', '2026-10-21 10:00:00'),
  (2, 'starfield',      'Beautiful planets, but loading screens everywhere broke the sense of exploring.', '2026-09-13 09:00:00'),
  (3, 'elden-ring',     'Four hundred hours in and I still find new builds. Perfect game for replays.', '2026-11-02 08:00:00'),
  (3, 'doom-eternal',   'The fastest, most aggressive shooter around. The soundtrack carries every fight.', '2026-10-03 12:00:00'),
  (4, 'baldurs-gate-3', 'Every choice matters. My second run felt like a different game.', '2026-10-29 15:00:00') AS new
  ON DUPLICATE KEY UPDATE body = new.body;

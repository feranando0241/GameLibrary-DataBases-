-- 001_seed: demo data generated from frontend/src/shared/api/mocks (ADR-0001 action 4b).
-- Apply after 001_init.sql. Idempotent: re-running updates the same rows.
--   mysql -u root geekbond < database/seeds/001_seed.sql

INSERT INTO users (id, username) VALUES (1, 'demo') AS new
  ON DUPLICATE KEY UPDATE username = new.username;

INSERT INTO genres (name) VALUES
  ('4X'),
  ('Action'),
  ('Action RPG'),
  ('Co-op'),
  ('Cyberpunk'),
  ('D&D'),
  ('Dark Fantasy'),
  ('Driving'),
  ('Exploration'),
  ('FPS'),
  ('Fast-Paced'),
  ('Gore'),
  ('Historical'),
  ('Horror'),
  ('Indie'),
  ('Metroidvania'),
  ('Mythology'),
  ('Open World'),
  ('Pixel Graphics'),
  ('Platformer'),
  ('RPG'),
  ('Racing'),
  ('Roguelike'),
  ('Sci-Fi'),
  ('Shooter'),
  ('Souls-like'),
  ('Space'),
  ('Story Rich'),
  ('Strategy'),
  ('Survival Horror'),
  ('Turn-Based'),
  ('Western') AS new
  ON DUPLICATE KEY UPDATE name = new.name;

INSERT INTO games (id, title, developer, publisher, release_year, format, cover_url, banner_url,
                   storage_gb, achievements_total, summary)
VALUES
  ('cyberpunk-2077', 'Cyberpunk 2077: Phantom Liberty', 'CD PROJEKT RED', 'CD PROJEKT RED', 2023, 'PC', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80', 78.4, 45, 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival. Phantom Liberty introduces an espionage thriller expansion with high-stakes government intrigue.'),
  ('elden-ring', 'Elden Ring: Shadow of the Erdtree', 'FromSoftware Inc.', 'Bandai Namco Entertainment', 2024, 'PC', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80', 60.2, 42, 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Traverse the Realm of Shadow in an epic continuation of Miyazaki’s masterpiece.'),
  ('baldurs-gate-3', 'Baldur''s Gate 3', 'Larian Studios', 'Larian Studios', 2023, 'PC', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80', 122, 53, 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening inside you, drawn from a mind flayer parasite planted in your brain.'),
  ('hades-2', 'Hades II', 'Supergiant Games', 'Supergiant Games', 2024, 'Steam Deck', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80', 10.5, 35, 'Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching sequel to the award-winning rogue-like dungeon crawler. Play as Melinoë, the Princess of the Underworld, in a fight spanning Olympus and Tartarus.'),
  ('starfield', 'Starfield', 'Bethesda Game Studios', 'Bethesda Softworks', 2023, 'Xbox Series X', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80', 125, 50, 'Starfield is the first new universe in 25 years from Bethesda Game Studios. In this next generation role-playing game set amongst the stars, create any character you want and explore with unparalleled freedom as you embark on an epic journey to answer humanity’s greatest mystery.'),
  ('hollow-knight-silksong', 'Hollow Knight: Silksong', 'Team Cherry', 'Team Cherry', 2025, 'Nintendo Switch', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80', 9, 40, 'Discover a vast, haunted kingdom in Hollow Knight: Silksong! The sequel to the award-winning action-adventure. Explore, fight and survive as Hornet, princess-protector of Hallownest, captured and brought to this strange world ruled by silk and song.'),
  ('witcher-3', 'The Witcher 3: Wild Hunt - Complete Edition', 'CD PROJEKT RED', 'CD PROJEKT RED', 2015, 'PC', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1920&q=80', 52, 78, 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.'),
  ('doom-eternal', 'DOOM Eternal', 'id Software', 'Bethesda Softworks', 2020, 'PC', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80', 89, 33, 'Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity. The only thing they fear... is you.'),
  ('red-dead-redemption-2', 'Red Dead Redemption 2', 'Rockstar Games', 'Rockstar Games', 2018, 'PlayStation 5', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80', 119.5, 51, 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive.'),
  ('stellaris', 'Stellaris: Grand Archive', 'Paradox Development Studio', 'Paradox Interactive', 2016, 'PC', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80', 16, 130, 'Explore a galaxy full of wonders in this sci-fi grand strategy game from Paradox Development Studio. Interact with diverse alien species, discover strange new worlds with unexpected events, and expand the reach of your empire.'),
  ('forza-horizon-5', 'Forza Horizon 5', 'Playground Games', 'Xbox Game Studios', 2021, 'Xbox Series X', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=80', 110, 54, 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico with limitless, fun driving action in hundreds of the world’s greatest cars.'),
  ('dead-cells', 'Dead Cells: Return to Castlevania', 'Motion Twin', 'Motion Twin', 2018, 'Steam Deck', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1920&q=80', 4.8, 90, 'Dead Cells is a rogue-lite, metroidvania inspired, action-platformer. You will explore a sprawling, ever-changing castle... assuming you’re able to fight your way past its keepers in 2D souls-lite combat. No checkpoints. Kill, die, learn, repeat.'),
  ('resident-evil-4', 'Resident Evil 4 Remake', 'Capcom', 'Capcom', 2023, 'PlayStation 5', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80', 58, 39, 'Survival is only the beginning. Six years have passed since the biological disaster in Raccoon City. Agent Leon S. Kennedy, one of the survivors, has been sent to rescue the president’s kidnapped daughter from a secluded European village.'),
  ('helldivers-2', 'Helldivers 2', 'Arrowhead Game Studios', 'PlayStation Publishing LLC', 2024, 'PC', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80', 70, 38, 'The Galaxy’s Last Line of Offence. Enlist in the Helldivers and join the fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person shooter. Spread Managed Democracy to alien worlds.'),
  ('civilization-7', 'Sid Meier’s Civilization VII', 'Firaxis Games', '2K', 2025, 'PC', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80', 40, 60, 'The award-winning strategy game franchise returns with a revolutionary new chapter. Rule as one of many visionary leaders from throughout history. Establish your civilization, construct cities, and expand your territory across distinct ages.')
AS new
  ON DUPLICATE KEY UPDATE title = new.title, developer = new.developer, publisher = new.publisher,
    release_year = new.release_year, format = new.format, cover_url = new.cover_url,
    banner_url = new.banner_url, storage_gb = new.storage_gb,
    achievements_total = new.achievements_total, summary = new.summary;

INSERT IGNORE INTO game_genres (game_id, genre_id)
SELECT v.game_id, ge.id
  FROM (
    SELECT 'cyberpunk-2077' AS game_id, 'RPG' AS genre
    UNION ALL SELECT 'cyberpunk-2077' AS game_id, 'Open World' AS genre
    UNION ALL SELECT 'cyberpunk-2077' AS game_id, 'Cyberpunk' AS genre
    UNION ALL SELECT 'cyberpunk-2077' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'elden-ring' AS game_id, 'Action RPG' AS genre
    UNION ALL SELECT 'elden-ring' AS game_id, 'Souls-like' AS genre
    UNION ALL SELECT 'elden-ring' AS game_id, 'Dark Fantasy' AS genre
    UNION ALL SELECT 'elden-ring' AS game_id, 'Open World' AS genre
    UNION ALL SELECT 'baldurs-gate-3' AS game_id, 'RPG' AS genre
    UNION ALL SELECT 'baldurs-gate-3' AS game_id, 'Turn-Based' AS genre
    UNION ALL SELECT 'baldurs-gate-3' AS game_id, 'Story Rich' AS genre
    UNION ALL SELECT 'baldurs-gate-3' AS game_id, 'D&D' AS genre
    UNION ALL SELECT 'hades-2' AS game_id, 'Roguelike' AS genre
    UNION ALL SELECT 'hades-2' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'hades-2' AS game_id, 'Mythology' AS genre
    UNION ALL SELECT 'hades-2' AS game_id, 'Indie' AS genre
    UNION ALL SELECT 'starfield' AS game_id, 'RPG' AS genre
    UNION ALL SELECT 'starfield' AS game_id, 'Space' AS genre
    UNION ALL SELECT 'starfield' AS game_id, 'Sci-Fi' AS genre
    UNION ALL SELECT 'starfield' AS game_id, 'Exploration' AS genre
    UNION ALL SELECT 'hollow-knight-silksong' AS game_id, 'Metroidvania' AS genre
    UNION ALL SELECT 'hollow-knight-silksong' AS game_id, 'Indie' AS genre
    UNION ALL SELECT 'hollow-knight-silksong' AS game_id, 'Souls-like' AS genre
    UNION ALL SELECT 'hollow-knight-silksong' AS game_id, 'Platformer' AS genre
    UNION ALL SELECT 'witcher-3' AS game_id, 'RPG' AS genre
    UNION ALL SELECT 'witcher-3' AS game_id, 'Open World' AS genre
    UNION ALL SELECT 'witcher-3' AS game_id, 'Dark Fantasy' AS genre
    UNION ALL SELECT 'witcher-3' AS game_id, 'Story Rich' AS genre
    UNION ALL SELECT 'doom-eternal' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'doom-eternal' AS game_id, 'FPS' AS genre
    UNION ALL SELECT 'doom-eternal' AS game_id, 'Fast-Paced' AS genre
    UNION ALL SELECT 'doom-eternal' AS game_id, 'Gore' AS genre
    UNION ALL SELECT 'red-dead-redemption-2' AS game_id, 'Open World' AS genre
    UNION ALL SELECT 'red-dead-redemption-2' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'red-dead-redemption-2' AS game_id, 'Western' AS genre
    UNION ALL SELECT 'red-dead-redemption-2' AS game_id, 'Story Rich' AS genre
    UNION ALL SELECT 'stellaris' AS game_id, 'Strategy' AS genre
    UNION ALL SELECT 'stellaris' AS game_id, 'Sci-Fi' AS genre
    UNION ALL SELECT 'stellaris' AS game_id, 'Space' AS genre
    UNION ALL SELECT 'stellaris' AS game_id, '4X' AS genre
    UNION ALL SELECT 'forza-horizon-5' AS game_id, 'Racing' AS genre
    UNION ALL SELECT 'forza-horizon-5' AS game_id, 'Open World' AS genre
    UNION ALL SELECT 'forza-horizon-5' AS game_id, 'Driving' AS genre
    UNION ALL SELECT 'forza-horizon-5' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'dead-cells' AS game_id, 'Roguelike' AS genre
    UNION ALL SELECT 'dead-cells' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'dead-cells' AS game_id, 'Indie' AS genre
    UNION ALL SELECT 'dead-cells' AS game_id, 'Pixel Graphics' AS genre
    UNION ALL SELECT 'dead-cells' AS game_id, 'Metroidvania' AS genre
    UNION ALL SELECT 'resident-evil-4' AS game_id, 'Horror' AS genre
    UNION ALL SELECT 'resident-evil-4' AS game_id, 'Survival Horror' AS genre
    UNION ALL SELECT 'resident-evil-4' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'resident-evil-4' AS game_id, 'Shooter' AS genre
    UNION ALL SELECT 'helldivers-2' AS game_id, 'Shooter' AS genre
    UNION ALL SELECT 'helldivers-2' AS game_id, 'FPS' AS genre
    UNION ALL SELECT 'helldivers-2' AS game_id, 'Action' AS genre
    UNION ALL SELECT 'helldivers-2' AS game_id, 'Sci-Fi' AS genre
    UNION ALL SELECT 'helldivers-2' AS game_id, 'Co-op' AS genre
    UNION ALL SELECT 'civilization-7' AS game_id, 'Strategy' AS genre
    UNION ALL SELECT 'civilization-7' AS game_id, 'Turn-Based' AS genre
    UNION ALL SELECT 'civilization-7' AS game_id, 'Historical' AS genre
    UNION ALL SELECT 'civilization-7' AS game_id, '4X' AS genre
  ) AS v
  JOIN genres ge ON ge.name = v.genre;

INSERT INTO user_games (user_id, game_id, status, score, hours_played, is_favorite,
                        is_installed, achievements_unlocked, notes, last_played_at, updated_at)
VALUES
  (1, 'baldurs-gate-3', 'CURRENT', 96, 184.2, TRUE, TRUE, 31, 'Act III in the Lower City.', '2026-10-31 20:00:00', '2026-11-03 12:00:00'),
  (1, 'civilization-7', NULL, NULL, 0, TRUE, FALSE, 0, NULL, NULL, '2026-11-03 20:00:00'),
  (1, 'cyberpunk-2077', 'CURRENT', 95, 142.5, TRUE, TRUE, 38, 'Playing through the Phantom Liberty espionage expansion.', '2026-11-02 20:00:00', '2026-11-03 12:00:00'),
  (1, 'dead-cells', 'PAUSED', 92, 92.6, TRUE, TRUE, 68, 'Stuck at 5 Boss Stem Cells.', '2026-11-03 20:00:00', '2026-11-03 12:00:00'),
  (1, 'doom-eternal', NULL, NULL, 88, FALSE, FALSE, 28, NULL, '2026-09-04 20:00:00', '2026-11-03 20:00:00'),
  (1, 'elden-ring', 'COMPLETED', 98, 218, TRUE, TRUE, 42, 'Completed Shadow of the Erdtree DLC 100%.', '2026-11-01 20:00:00', '2026-11-03 12:00:00'),
  (1, 'forza-horizon-5', NULL, NULL, 52.4, FALSE, TRUE, 30, NULL, '2026-10-30 20:00:00', '2026-11-03 20:00:00'),
  (1, 'hades-2', 'CURRENT', 92, 64.8, FALSE, TRUE, 24, 'Deep runs toward the surface.', '2026-10-29 20:00:00', '2026-11-03 12:00:00'),
  (1, 'helldivers-2', NULL, NULL, 74, FALSE, FALSE, 29, NULL, '2026-10-31 20:00:00', '2026-11-03 20:00:00'),
  (1, 'hollow-knight-silksong', 'PLANNING', 0, 0, TRUE, FALSE, 0, 'Waiting for official release.', NULL, '2026-11-03 12:00:00'),
  (1, 'red-dead-redemption-2', NULL, NULL, 195.3, FALSE, TRUE, 40, NULL, '2026-11-02 20:00:00', '2026-11-03 20:00:00'),
  (1, 'resident-evil-4', NULL, NULL, 32.5, FALSE, TRUE, 25, NULL, '2026-10-20 20:00:00', '2026-11-03 20:00:00'),
  (1, 'starfield', 'DROPPED', 68, 45.1, FALSE, FALSE, 19, 'Explored 10 star systems, campaign became too repetitive.', '2026-10-13 20:00:00', '2026-11-03 12:00:00'),
  (1, 'stellaris', NULL, NULL, 240, FALSE, FALSE, 55, NULL, '2026-10-04 20:00:00', '2026-11-03 20:00:00'),
  (1, 'witcher-3', 'COMPLETED', 97, 310.4, TRUE, TRUE, 65, 'Finished Blood and Wine & Hearts of Stone.', '2026-10-27 20:00:00', '2026-11-03 12:00:00')
AS new
  ON DUPLICATE KEY UPDATE status = new.status, score = new.score, hours_played = new.hours_played,
    is_favorite = new.is_favorite, is_installed = new.is_installed,
    achievements_unlocked = new.achievements_unlocked, notes = new.notes,
    last_played_at = new.last_played_at, updated_at = new.updated_at;

// database/rawg.ts: mapping RAWG's API shape onto our schema, and SQL escaping. No network, no MySQL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSkipped, sqlString, toSeedGame, toSeedSql, type RawgGame, type SeedGame } from '../../database/rawg.ts';

const base: RawgGame = {
  slug: 'the-game',
  name: 'The Game',
  released: '2020-05-01',
  background_image: 'https://media.rawg.io/a.jpg',
  platforms: [{ platform: { name: 'PlayStation 4' } }, { platform: { name: 'PC' } }],
  genres: [{ name: 'Action' }],
  developers: [{ name: 'Studio' }],
  publishers: [{ name: 'Publisher' }],
};

test('maps the fields our games table needs', () => {
  const game = toSeedGame(base) as SeedGame;
  assert.equal(game.id, 'the-game');
  assert.equal(game.releaseYear, 2020);
  assert.equal(game.format, 'PC');
  assert.deepEqual(game.platforms, ['PlayStation 4', 'PC']);
  assert.equal(game.bannerUrl, 'https://media.rawg.io/a.jpg', 'falls back to the cover image');
});

test('picks the preferred format and renames Xbox Series S/X to our ENUM value', () => {
  const xbox = toSeedGame({ ...base, platforms: [{ platform: { name: 'Xbox Series S/X' } }] }) as SeedGame;
  assert.equal(xbox.format, 'Xbox Series X');
  assert.deepEqual(xbox.platforms, ['Xbox Series X']);
});

test('a game with no publisher is treated as self-published', () => {
  assert.equal((toSeedGame({ ...base, publishers: [] }) as SeedGame).publisher, 'Studio');
});

test('skips games the schema cannot hold, with a reason', () => {
  const cases: [Partial<RawgGame>, RegExp][] = [
    [{ released: null }, /release/],
    [{ developers: [] }, /developer/],
    [{ platforms: [{ platform: { name: 'PlayStation 4' } }] }, /not on/],
    [{ slug: 'Bad Slug!' }, /slug/],
  ];
  for (const [patch, reason] of cases) {
    const result = toSeedGame({ ...base, ...patch });
    assert.ok(isSkipped(result), JSON.stringify(patch));
    assert.match(result.reason, reason);
  }
});

test('long descriptions are cut to fit, at a word boundary', () => {
  const game = toSeedGame({ ...base, description_raw: 'word '.repeat(1000) }) as SeedGame;
  assert.ok((game.summary ?? '').length <= 2000);
  assert.ok((game.summary ?? '').endsWith('word…'));
});

test('sqlString escapes quotes and backslashes, and maps null to NULL', () => {
  assert.equal(sqlString("Baldur's Gate"), "'Baldur''s Gate'");
  assert.equal(sqlString('C:\\games'), "'C:\\\\games'");
  assert.equal(sqlString(null), 'NULL');
});

test('the seed never contains a raw quote that could end a string early', () => {
  const sql = toSeedSql([toSeedGame({ ...base, name: "Tom Clancy's '); DROP TABLE games; --" }) as SeedGame]);
  assert.match(sql, /'Tom Clancy''s ''\); DROP TABLE games; --'/);
});

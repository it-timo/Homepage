const assert = require('node:assert/strict');
const test = require('node:test');
const { parseLrc, findActiveLyricIndex, formatRuntime } = require('../script.js');

test('parses timestamps, repeated timestamps, and millisecond offset', () => {
  const lyrics = parseLrc('[ar:Timo]\n[offset:250]\n[00:01.50][00:03.000]Line one\n[00:05]Line two');
  assert.equal(lyrics.metadata.ar, 'Timo');
  assert.deepEqual(lyrics.synced, [
    { time: 1.75, text: 'Line one' },
    { time: 3.25, text: 'Line one' },
    { time: 5.25, text: 'Line two' },
  ]);
});

test('ignores an invalid offset instead of corrupting timestamps', () => {
  const lyrics = parseLrc('[offset:later]\n[00:02]Line');
  assert.equal(lyrics.synced[0].time, 2);
});

test('preserves plain lyrics when timestamps are unavailable', () => {
  const lyrics = parseLrc('[ti:Song]\nFirst line\nSecond line');
  assert.deepEqual(lyrics.synced, []);
  assert.deepEqual(lyrics.plain, ['First line', 'Second line']);
});

test('finds the active lyric at playback boundaries', () => {
  const lines = [{ time: 2 }, { time: 5 }, { time: 9 }];
  assert.equal(findActiveLyricIndex(lines, 1.9), -1);
  assert.equal(findActiveLyricIndex(lines, 2), 0);
  assert.equal(findActiveLyricIndex(lines, 8.99), 1);
  assert.equal(findActiveLyricIndex(lines, 12), 2);
});

test('formats seek labels consistently', () => {
  assert.equal(formatRuntime(65), '1:05');
});

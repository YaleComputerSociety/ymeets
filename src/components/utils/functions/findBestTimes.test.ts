import { findBestTimes } from './findBestTimes';

/** Block start minutes for a continuous range, e.g. range(9 * 60, 8) = 9:00 to 10:45. */
const range = (startMinute: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => startMinute + i * 15);

/** One person's availability: `cols` days of `blocks` blocks, all set to `free`. */
const person = (cols: number, blocks: number, free = true): boolean[][] =>
  Array.from({ length: cols }, () => Array(blocks).fill(free));

test('returns nothing when no participants are selected', () => {
  expect(findBestTimes([person(1, 8)], [], 1, range(540, 8), 60)).toEqual([]);
});

test('finds a window everyone can attend on a normal same-day calendar', () => {
  const availabilities = [person(1, 8), person(1, 8)];
  const result = findBestTimes(availabilities, [0, 1], 1, range(540, 8), 60);

  expect(result[0]).toEqual({
    col: 0,
    startBlock: 0,
    endBlock: 3,
    availableIdx: [0, 1],
    missingIdx: [],
  });
});

test('ranks windows with more available people first', () => {
  // Person 1 is only free in the second hour
  const busyFirstHour = [[false, false, false, false, true, true, true, true]];
  const result = findBestTimes(
    [person(1, 8), busyFirstHour],
    [0, 1],
    1,
    range(540, 8),
    60
  );

  expect(result[0].startBlock).toBe(4);
  expect(result[0].availableIdx).toEqual([0, 1]);
});

test('never suggests a window across a jump in time', () => {
  // A column wrapping past midnight stores 00:00-01:45, then 20:00-23:45
  const blockStartMinutes = [...range(0, 8), ...range(20 * 60, 16)];
  const blocks = blockStartMinutes.length;
  const result = findBestTimes(
    [person(1, blocks)],
    [0],
    1,
    blockStartMinutes,
    60,
    15,
    100
  );

  expect(result.length).toBeGreaterThan(0);
  for (const w of result) {
    const crossesJump = w.startBlock <= 7 && w.endBlock >= 8;
    expect(crossesJump).toBe(false);
  }
});

test('a window may run past midnight when the blocks are continuous', () => {
  // 23:00 to 01:00, stored in time order with the after-midnight blocks offset by a day
  const blockStartMinutes = range(23 * 60, 8);
  const result = findBestTimes(
    [person(1, 8)],
    [0],
    1,
    blockStartMinutes,
    120
  );

  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({ startBlock: 0, endBlock: 7 });
});

test("one person's short row doesn't remove the day for everyone", () => {
  // Person 1's row only covers the first 2 blocks
  const shortRow = [[true, true]];
  const result = findBestTimes(
    [person(1, 8), shortRow],
    [0, 1],
    1,
    range(540, 8),
    60
  );

  expect(result.length).toBeGreaterThan(0);
  expect(result[0].availableIdx).toEqual([0]);
  expect(result[0].missingIdx).toEqual([1]);
});

import { BoundingBox } from './types';

test('BoundingBox instantiates from pre-sorted coordinates', () => {
  const topLeft = { col: 1, block: 3 };
  const bottomRight = { col: 5, block: 7 };
  const box = new BoundingBox(topLeft, bottomRight);
  expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
});

test('BoundingBox instantiates from flipped coordinates', () => {
  const topLeft = { col: 1, block: 3 };
  const bottomRight = { col: 5, block: 7 };
  const box = new BoundingBox(bottomRight, topLeft);
  expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
});

test('BoundingBox instantiates from mixed-order coordinates', () => {
  const topLeft = { col: 1, block: 7 };
  const bottomRight = { col: 5, block: 3 };
  const box = new BoundingBox(bottomRight, topLeft);
  expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
});

test('1x1 BoundingBox contains its only point', () => {
  const point = { col: 3, block: 5 };
  const box = new BoundingBox(point, point);
  expect(box.contains(point)).toBe(true);
});

test('BoundingBox excludes too-left points', () => {
  const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
  const left = { col: 2, block: 5 };
  expect(box.contains(left)).toBe(false);
});

test('BoundingBox excludes too-right points', () => {
  const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
  const left = { col: 4, block: 5 };
  expect(box.contains(left)).toBe(false);
});

test('BoundingBox excludes too-high points', () => {
  const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
  const left = { col: 3, block: 4 };
  expect(box.contains(left)).toBe(false);
});

test('BoundingBox excludes too-low points', () => {
  const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
  const left = { col: 3, block: 6 };
  expect(box.contains(left)).toBe(false);
});

test('BoundingBox iteration hits every contained point', () => {
  const box = new BoundingBox({ col: 1, block: 3 }, { col: 2, block: 5 });
  const expectedPoints = [
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 3],
    [2, 4],
    [2, 5],
  ].map(([col, block]) => ({ col, block }));
  const actualPoints = Array.from(box);
  expect(actualPoints.length).toBe(expectedPoints.length);
  for (const point of expectedPoints) {
    expect(actualPoints).toContainEqual(point);
  }
});

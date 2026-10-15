import { Availability, BoundingBox, DraggedSelection } from './types';

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

test('DraggedSelection.computeDirtyBlocks correctly computes dirty blocks from crossed selections', () => {
  const initialAvailability: Availability = [
    [false, false, false],
    [true, false, true],
    [false, false, false],
  ];
  const availability = initialAvailability.map((row) => row.slice());

  const horizontal = new BoundingBox(
    { col: 0, block: 1 },
    { col: 2, block: 1 }
  );
  [availability[0][1], availability[1][1], availability[2][1]] = [
    true,
    true,
    true,
  ];
  const vertical = new BoundingBox({ col: 1, block: 0 }, { col: 1, block: 2 });

  const dirtyBlocks = DraggedSelection.computeDirtyBlocks(
    horizontal,
    vertical,
    initialAvailability,
    true
  );
  // Intentionally not checking exact returns since that's an implementation detail.
  for (const {
    coords: { col, block },
    setTo,
  } of dirtyBlocks) {
    availability[col][block] = setTo;
  }

  expect(availability).toStrictEqual([
    [false, false, false],
    [true, true, true],
    [false, false, false],
  ]);
});

test('DraggedSelection.computeDirtyBlocks handles setsBlocksTo: false', () => {
  const availability: Availability = [[false, true]];
  const singleton = new BoundingBox({ col: 0, block: 0 }, { col: 0, block: 0 });
  const wholeGrid = new BoundingBox({ col: 0, block: 0 }, { col: 0, block: 1 });
  const dirtyBlocks = DraggedSelection.computeDirtyBlocks(
    singleton,
    wholeGrid,
    availability,
    false
  );

  for (const {
    coords: { col, block },
    setTo,
  } of dirtyBlocks) {
    availability[col][block] = setTo;
  }

  expect(availability).toStrictEqual([[false, false]]);
});

test('DraggedSelection properly applies changes through several mouse moves', () => {
  const availability: Availability = [
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
  ];

  const drag = new DraggedSelection(
    availability,
    { col: 2, block: 2 },
    ({ col, block }, setTo) => (availability[col][block] = setTo)
  );
  expect(availability).toStrictEqual([
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, true, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
  ]);

  drag.moveTo({ col: 4, block: 3 });
  expect(availability).toStrictEqual([
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, true, true, false],
    [true, false, true, true, true],
    [false, true, true, true, false],
  ]);

  drag.moveTo({ col: 3, block: 4 });
  expect(availability).toStrictEqual([
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, true, true, true],
    [true, false, true, true, true],
    [false, true, false, true, false],
  ]);

  drag.moveTo({ col: 0, block: 0 });
  expect(availability).toStrictEqual([
    [true, true, true, true, false],
    [true, true, true, false, true],
    [true, true, true, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
  ]);
});

test('DraggedSelection deselects blocks when starting on true', () => {
  const availability = [[true, true]];
  const drag = new DraggedSelection(
    availability,
    { col: 0, block: 0 },
    ({ col, block }, setTo) => (availability[col][block] = setTo)
  );
  expect(availability).toStrictEqual([[false, true]]);
  drag.moveTo({ col: 0, block: 1 });
  expect(availability).toStrictEqual([[false, false]]);
});

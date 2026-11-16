import {
  Availability,
  BoundingBox,
  DraggedSelection,
  computeLiteExpiry,
  copyAndReplace,
} from './types';

describe('computeLiteExpiry', () => {
  it('expires 30 days after the end of the last date', () => {
    const dates = [new Date(2026, 10, 3), new Date(2026, 10, 5)];
    const created = new Date(2026, 9, 28, 14, 30);
    expect(computeLiteExpiry(dates, created)).toEqual(new Date(2026, 11, 6));
  });

  it('uses the latest date even when dates are unsorted', () => {
    const dates = [new Date(2026, 10, 5, 9), new Date(2026, 10, 3)];
    const created = new Date(2026, 9, 28);
    expect(computeLiteExpiry(dates, created)).toEqual(new Date(2026, 11, 6));
  });

  it('uses the creation date for general-days events', () => {
    // General-days events store placeholder dates in the year 2000
    const dates = [new Date(2000, 0, 3), new Date(2000, 0, 5)];
    const created = new Date(2026, 9, 28, 14, 30);
    expect(computeLiteExpiry(dates, created)).toEqual(new Date(2026, 10, 28));
  });

  it('uses the creation date when all dates are in the past', () => {
    const dates = [new Date(2026, 8, 1), new Date(2026, 8, 3)];
    const created = new Date(2026, 9, 28, 14, 30);
    expect(computeLiteExpiry(dates, created)).toEqual(new Date(2026, 10, 28));
  });

  it('does not modify its inputs', () => {
    const dates = [new Date(2026, 10, 3)];
    const created = new Date(2026, 9, 28);
    computeLiteExpiry(dates, created);
    expect(dates).toEqual([new Date(2026, 10, 3)]);
    expect(created).toEqual(new Date(2026, 9, 28));
  });
});

describe('BoundingBox', () => {
  describe('constructor', () => {
    it('works from pre-sorted coordinates', () => {
      const topLeft = { col: 1, block: 3 };
      const bottomRight = { col: 5, block: 7 };
      const box = new BoundingBox(topLeft, bottomRight);
      expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
    });

    it('works from flipped coordinates', () => {
      const topLeft = { col: 1, block: 3 };
      const bottomRight = { col: 5, block: 7 };
      const box = new BoundingBox(bottomRight, topLeft);
      expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
    });

    it('works from mixed-order coordinates', () => {
      const topLeft = { col: 1, block: 7 };
      const bottomRight = { col: 5, block: 3 };
      const box = new BoundingBox(bottomRight, topLeft);
      expect({ ...box }).toStrictEqual({ left: 1, right: 5, top: 3, bottom: 7 });
    });
  });

  describe('contains', () => {
    it('includes the correct point in a 1x1', () => {
      const point = { col: 3, block: 5 };
      const box = new BoundingBox(point, point);
      expect(box.contains(point)).toBe(true);
    });

    it('excludes too-left points', () => {
      const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
      const left = { col: 2, block: 5 };
      expect(box.contains(left)).toBe(false);
    });

    it('excludes too-right points', () => {
      const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
      const left = { col: 4, block: 5 };
      expect(box.contains(left)).toBe(false);
    });

    it('excludes too-high points', () => {
      const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
      const left = { col: 3, block: 4 };
      expect(box.contains(left)).toBe(false);
    });

    it('excludes too-low points', () => {
      const box = new BoundingBox({ col: 3, block: 5 }, { col: 3, block: 5 });
      const left = { col: 3, block: 6 };
      expect(box.contains(left)).toBe(false);
    });
  });

  describe('[Symbol.iterator]', () => {
    it('iterates over exactly every contained point', () => {
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
  });
});

describe('copyAndReplace', () => {
  it('replaces the chosen array', () => {
    const availability: Availability[] = [[], [], []];
    const replaced = copyAndReplace(availability, 1, [[true]]);
    expect(replaced).toStrictEqual([[], [[true]], []]);
  });

  it('returns an independent copy', () => {
    const availability: Availability[] = [[], [], []];
    const replaced = copyAndReplace(availability, 0, [[true]]);
    expect(replaced === availability).toBe(false);
    expect(availability).toStrictEqual([[], [], []]);
  });
});

describe('DraggedSelection', () => {
  describe('create', () => {
    it('computes correct results', () => {
      const availability = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false],
      ];
      const { selection, newAvailability } = DraggedSelection.create(availability, {
        col: 1,
        block: 2,
      });
      expect({ ...selection }).toStrictEqual({
        left: 1,
        right: 1,
        top: 2,
        bottom: 2,
      });
      expect(newAvailability).toStrictEqual([
        [false, false, false],
        [false, false, true],
        [false, false, false],
        [false, false, false],
      ]);
    });

    it('flips based on origin', () => {
      const { newAvailability } = DraggedSelection.create([[true]], {
        col: 0,
        block: 0,
      });
      expect(newAvailability).toStrictEqual([[false]]);
    });
  });

  describe('computeSelection', () => {
    it('computes results correctly', () => {
      const availability = [
        [false, true, false, true, false],
        [true, false, true, false, true],
        [false, true, false, true, false],
        [true, false, true, false, true],
        [false, true, false, true, false],
      ];
      const drag = new DraggedSelection(availability, { col: 2, block: 2 });
      const { selection, newAvailability } = drag.computeSelection({
        col: 3,
        block: 4,
      });
      expect({ ...selection }).toStrictEqual({
        left: 2,
        right: 3,
        top: 2,
        bottom: 4,
      });
      expect(newAvailability).toStrictEqual([
        [false, true, false, true, false],
        [true, false, true, false, true],
        [false, true, true, true, true],
        [true, false, true, true, true],
        [false, true, false, true, false],
      ]);
    });
  });

  it('is independent of source grid', () => {
    const availability = [[false, false, false]];
    const drag = new DraggedSelection(availability, { col: 0, block: 1 });
    availability[0] = [true, true, true];
    const { newAvailability } = drag.computeSelection({ col: 0, block: 1 });
    expect(newAvailability).toStrictEqual([[false, true, false]]);
    expect(availability).toStrictEqual([[true, true, true]]);
  });
});

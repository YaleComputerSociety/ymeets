import {
  parse,
  timeToMinutes,
  dateToMinutes,
  areSameDate,
  doesBlockOverlapEvent,
  doesEventStartInBlock,
  doesEventEndInBlock,
} from './CalRow';

/**
 * Returns a date string that is guaranteed to be Date.parse-valid, as defined by the spec.
 */
const validDateString = new Date().toISOString();

test('parse rejects invalid events', () => {
  const rawEvents = [
    { summary: '', start: { dateTime: validDateString } },
    { summary: '', end: { dateTime: validDateString } },
    {
      summary: '',
      start: { dateTime: validDateString },
      end: { dateTime: 'gibberish' },
    },
    {
      summary: '',
      start: { dateTime: 'gibberish' },
      end: { dateTime: validDateString },
    },
  ];
  for (const rawEvent of rawEvents) {
    expect(parse(rawEvent)).toBe(undefined);
  }
});

test('parse correctly parses events with all relevant properties', () => {
  const fullEvent = parse({
    summary: 'foo',
    start: { dateTime: validDateString },
    end: { dateTime: validDateString },
  });
  expect(fullEvent).toBeDefined();
  expect(fullEvent).toHaveProperty('name', 'foo');
  expect(fullEvent!.start).not.toBeNaN();
  expect(fullEvent!.end).not.toBeNaN();
});

test('parsing events with missing summaries sets name to null', () => {
  const missingName = parse({
    start: { dateTime: validDateString },
    end: { dateTime: validDateString },
  });
  expect(missingName).toBeDefined();
  expect(missingName).toHaveProperty('name', null);
  expect(missingName!.start).not.toBeNaN();
  expect(missingName!.end).not.toBeNaN();
});

test('timeToMinutes returns minutes since 00:00', () => {
  const times = [
    { timeString: '00:00', minutes: 0 },
    { timeString: '12:00', minutes: 720 },
    { timeString: '23:59', minutes: 1439 },
  ];
  for (const { timeString, minutes } of times) {
    expect(timeToMinutes(timeString)).toBe(minutes);
  }
});

test('dateToMinutes returns minutes since 00:00', () => {
  const dates = [
    { date: new Date(2000, 1, 1, 0, 0), minutes: 0 },
    { date: new Date(2005, 5, 5, 12, 0), minutes: 720 },
    { date: new Date(2010, 10, 10, 23, 59), minutes: 1439 },
  ];
  for (const { date, minutes } of dates) {
    expect(dateToMinutes(date)).toBe(minutes);
  }
});

test('areSameDate returns true for same-day dates', () => {
  const sameDayDates = [
    [new Date(2000, 1, 1, 0, 0), new Date(2000, 1, 1, 23, 59)],
    [new Date(2005, 5, 5, 12, 0), new Date(2005, 5, 5, 12, 0)],
  ];
  for (const [date1, date2] of sameDayDates) {
    expect(areSameDate(date1, date2)).toBe(true);
  }
});

test('areSameDate returns false for different-day dates', () => {
  const differentDayDates = [
    [new Date(2000, 1, 1, 23, 59), new Date(2000, 1, 2, 0, 0)],
    [new Date(2005, 5, 5, 0, 0), new Date(2005, 5, 6, 23, 59)],
    [new Date(2010, 10, 10, 12, 12), new Date(2010, 10, 11, 12, 12)],
  ];
  for (const [date1, date2] of differentDayDates) {
    expect(areSameDate(date1, date2)).toBe(false);
  }
});

const event = {
  name: null,
  start: new Date(2000, 1, 1, 0, 25),
  end: new Date(2000, 1, 1, 0, 50),
};

test('doesBlockOverlapEvent returns true when only one block boundary is contained', () => {
  expect(doesBlockOverlapEvent(event, 30, 25)).toBe(true);
  expect(doesBlockOverlapEvent(event, 15, 25)).toBe(true);
});

test('doesBlockOverlapEvent returns false for disjoint blocks and events', () => {
  expect(doesBlockOverlapEvent(event, 0, 24)).toBe(false);
  expect(doesBlockOverlapEvent(event, 51, 25)).toBe(false);
});

test('doesBlockOverlapEvent returns false for near misses', () => {
  expect(doesBlockOverlapEvent(event, 0, 25)).toBe(false);
  expect(doesBlockOverlapEvent(event, 50, 25)).toBe(false);
});

const eventBoundary = new Date(2000, 1, 1, 0, 50);

test('event boundary checkers return true when boundary is in block', () => {
  expect(doesEventStartInBlock(eventBoundary, 25, 50)).toBe(true);
  expect(doesEventEndInBlock(eventBoundary, 25, 50)).toBe(true);
});

test('event boundary checkers return false when boundaries are outside block', () => {
  expect(doesEventStartInBlock(eventBoundary, 0, 25)).toBe(false);
  expect(doesEventEndInBlock(eventBoundary, 0, 25)).toBe(false);
});

test('event boundary checkers return true when same-side boundaries match', () => {
  expect(doesEventStartInBlock(eventBoundary, 50, 25)).toBe(true);
  expect(doesEventEndInBlock(eventBoundary, 25, 25)).toBe(true);
});

test('event boundary checkers return false when opposite boundaries match', () => {
  expect(doesEventStartInBlock(eventBoundary, 25, 25)).toBe(false);
  expect(doesEventEndInBlock(eventBoundary, 50, 25)).toBe(false);
});

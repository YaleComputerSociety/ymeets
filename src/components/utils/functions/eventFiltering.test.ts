import {
  parse,
  timeToMinutes,
  areSameDate,
  doesBlockOverlapEvent,
  doesEventStartInBlock,
  doesEventEndInBlock,
  doesBlockOverlapAnyEvent,
} from './eventFiltering';

describe('parse', () => {
  /**
   * A date string that is guaranteed to be Date.parse-valid, as defined by the spec.
   */
  const validDateString = new Date().toISOString();

  it('rejects invalid events', () => {
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

  it('correctly parses events with all relevant properties', () => {
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

  it('nullifies name on missing summaries', () => {
    const missingName = parse({
      start: { dateTime: validDateString },
      end: { dateTime: validDateString },
    });
    expect(missingName).toBeDefined();
    expect(missingName).toHaveProperty('name', null);
    expect(missingName!.start).not.toBeNaN();
    expect(missingName!.end).not.toBeNaN();
  });
});

describe('timeToMinutes', () => {
  it('returns minutes since 00:00', () => {
    const times = [
      { timeString: '00:00', minutes: 0 },
      { timeString: '12:00', minutes: 720 },
      { timeString: '23:59', minutes: 1439 },
    ];
    for (const { timeString, minutes } of times) {
      expect(timeToMinutes(timeString)).toBe(minutes);
    }
  });
});

describe('areSameDate', () => {
  it('returns true for same-day dates', () => {
    const sameDayDates = [
      [new Date(2000, 1, 1, 0, 0), new Date(2000, 1, 1, 23, 59)],
      [new Date(2005, 5, 5, 12, 0), new Date(2005, 5, 5, 12, 0)],
    ];
    for (const [date1, date2] of sameDayDates) {
      expect(areSameDate(date1, date2)).toBe(true);
    }
  });

  it('returns false for different-day dates', () => {
    const differentDayDates = [
      [new Date(2000, 1, 1, 23, 59), new Date(2000, 1, 2, 0, 0)],
      [new Date(2005, 5, 5, 0, 0), new Date(2005, 5, 6, 23, 59)],
      [new Date(2010, 10, 10, 12, 12), new Date(2010, 10, 11, 12, 12)],
    ];
    for (const [date1, date2] of differentDayDates) {
      expect(areSameDate(date1, date2)).toBe(false);
    }
  });
});

describe('doesBlockOverlapEvent', () => {
  const event = {
    name: null,
    start: new Date(2000, 1, 1, 0, 25),
    end: new Date(2000, 1, 1, 0, 50),
  };

  it('returns true when only one block boundary is contained', () => {
    expect(doesBlockOverlapEvent(event, 30, 25)).toBe(true);
    expect(doesBlockOverlapEvent(event, 15, 25)).toBe(true);
  });

  it('returns false for disjoint blocks and events', () => {
    expect(doesBlockOverlapEvent(event, 0, 24)).toBe(false);
    expect(doesBlockOverlapEvent(event, 51, 25)).toBe(false);
  });

  it('returns false for near misses', () => {
    expect(doesBlockOverlapEvent(event, 0, 25)).toBe(false);
    expect(doesBlockOverlapEvent(event, 50, 25)).toBe(false);
  });
});

describe('event boundary checkers', () => {
  const eventBoundary = new Date(2000, 1, 1, 0, 50);

  it('return true when boundary is in block', () => {
    expect(doesEventStartInBlock(eventBoundary, 25, 50)).toBe(true);
    expect(doesEventEndInBlock(eventBoundary, 25, 50)).toBe(true);
  });

  it('return false when boundaries are outside block', () => {
    expect(doesEventStartInBlock(eventBoundary, 0, 25)).toBe(false);
    expect(doesEventEndInBlock(eventBoundary, 0, 25)).toBe(false);
  });

  it('return true when same-side boundaries match', () => {
    expect(doesEventStartInBlock(eventBoundary, 50, 25)).toBe(true);
    expect(doesEventEndInBlock(eventBoundary, 25, 25)).toBe(true);
  });

  it('return false when opposite boundaries match', () => {
    expect(doesEventStartInBlock(eventBoundary, 25, 25)).toBe(false);
    expect(doesEventEndInBlock(eventBoundary, 50, 25)).toBe(false);
  });
});

describe('doesBlockOverlapAnyEvent', () => {
  const day = new Date(2026, 10, 10);
  const event = (start: string, end: string) => ({
    summary: 'e',
    start: { dateTime: `2026-11-10T${start}:00` },
    end: { dateTime: `2026-11-10T${end}:00` },
  });

  it('excludes events ending on block starts', () => {
    const events = [event('16:00', '17:00')];
    expect(doesBlockOverlapAnyEvent(events, '17:00', day, 15)).toBe(false);
    expect(doesBlockOverlapAnyEvent(events, '16:45', day, 15)).toBe(true);
  });

  it('correctly marks blocks on and off off-grid', () => {
    const events = [event('16:56', '17:10')];
    expect(doesBlockOverlapAnyEvent(events, '16:45', day, 15)).toBe(true);
    expect(doesBlockOverlapAnyEvent(events, '17:00', day, 15)).toBe(true);
    expect(doesBlockOverlapAnyEvent(events, '17:15', day, 15)).toBe(false);
  });

  it('ignores all-day events and other days', () => {
    const allDay = { summary: 'x', start: { date: '2026-11-10' }, end: { date: '2026-11-11' } };
    expect(doesBlockOverlapAnyEvent([allDay], '12:00', day, 15)).toBe(false);
    expect(doesBlockOverlapAnyEvent([event('16:00', '17:00')], '16:00', new Date(2026, 10, 11), 15)).toBe(false);
  });
});

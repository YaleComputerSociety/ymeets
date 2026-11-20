import { DateTime } from 'luxon';
import { BoundingBox, calendarDate, calendarDimensions } from '../../../types';
import { getSelectionDates, getSelectionForDates } from './googleCalendarExport';
import { getUserTimezone } from './timzoneConversions';

// getStoredBlockTimes compares the grid's column count with the event's own dates
let mockEventDateCount = 0;
jest.mock('../../../backend/events', () => ({
  getDates: () => Array.from({ length: mockEventDateCount }),
  getEventObjectForGCal: jest.fn(),
}));

function makeFramework(
  dates: Date[],
  startHour: number,
  endHour: number,
  eventDateCount = dates.length,
  // An untouched grid holds getUserTimezone()'s default
  timezone = getUserTimezone()
): calendarDimensions {
  mockEventDateCount = eventDateCount;
  return {
    dates: [
      dates.map(
        (date, id): calendarDate => ({
          id,
          shortenedWeekDay: '',
          calendarDay: String(date.getDate()),
          month: '',
          date,
        })
      ),
    ],
    startTime: new Date(2025, 0, 1, startHour, 0),
    endTime: new Date(2025, 0, 1, endHour, 0),
    numOfBlocks: 0,
    numOfCols: dates.length,
    timezone,
  };
}

/** A box as [left, right, top, bottom], for comparing. */
const corners = (box: BoundingBox | undefined) =>
  box && [box.left, box.right, box.top, box.bottom];

const days = [new Date(2025, 10, 24), new Date(2025, 10, 25), new Date(2025, 10, 26)];

/** Turns a selection into dates and back. */
function roundTrip(framework: calendarDimensions, selection: BoundingBox) {
  const dates = getSelectionDates(selection, framework);
  if ('error' in dates) throw new Error(dates.error);
  return corners(getSelectionForDates(dates.start, dates.end, framework));
}

test('a selection round-trips through dates', () => {
  const framework = makeFramework(days, 9, 17);
  expect(roundTrip(framework, new BoundingBox({ col: 1, block: 4 }, { col: 1, block: 11 }))).toEqual([1, 1, 4, 11]);
  expect(roundTrip(framework, new BoundingBox({ col: 2, block: 0 }, { col: 2, block: 0 }))).toEqual([2, 2, 0, 0]);
});

test('a selection that crosses midnight round-trips', () => {
  // A time zone shift turned 2 event dates into 3 columns running 22:00 into the next day
  const framework = makeFramework(days, 22, 2, 2);
  expect(roundTrip(framework, new BoundingBox({ col: 0, block: 6 }, { col: 0, block: 11 }))).toEqual([0, 0, 6, 11]);
});

test('general-days events match on weekday and time', () => {
  // Placeholder dates in 2000: Jan 3 is a Monday, Jan 4 a Tuesday
  const framework = makeFramework([new Date(2000, 0, 3), new Date(2000, 0, 4)], 9, 17);
  const tuesday = (hour: number, minute = 0) => new Date(2025, 11, 9, hour, minute);
  expect(corners(getSelectionForDates(tuesday(13), tuesday(14, 30), framework))).toEqual([1, 1, 16, 21]);
});

test('a time that is not on the grid gives no box', () => {
  const framework = makeFramework(days, 9, 17);
  expect(getSelectionForDates(new Date(2025, 10, 30, 10), new Date(2025, 10, 30, 11), framework)).toBeUndefined();
  expect(getSelectionForDates(new Date(2025, 10, 24, 7), new Date(2025, 10, 24, 8), framework)).toBeUndefined();
});

test('a grid switched to another zone highlights the time in that zone', () => {
  // A meeting at 10:00-11:00 Los Angeles time, on a grid switched to Los Angeles
  const framework = makeFramework(days, 9, 17, days.length, 'America/Los_Angeles');
  const la = (hour: number) =>
    DateTime.fromObject({ year: 2025, month: 11, day: 25, hour }, { zone: 'America/Los_Angeles' }).toJSDate();
  expect(corners(getSelectionForDates(la(10), la(11), framework))).toEqual([1, 1, 4, 7]);
});

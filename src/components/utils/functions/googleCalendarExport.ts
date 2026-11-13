import { BoundingBox, calendarDimensions } from '../../../types';
import { getDates, getEventObjectForGCal } from '../../../backend/events';
import { generateTimeBlocks } from './generateTimeBlocks';

/**
 * Formats a date as the UTC `YYYYMMDDTHHMMSSZ` string Google Calendar expects.
 */
function toGCalDateString(date: Date | string): string {
  return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '');
}

/**
 * Returns the next occurrence (after today) of the given weekday.
 * Used for "general days" events, whose dates are year-2000 placeholders.
 */
function getNextDayOccurrence(targetDayNum: number): Date {
  const date = new Date();
  let daysToAdd = targetDayNum - date.getDay();
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Returns the time labels in the order of the stored block IDs that drag
 * selections use, plus, for each block, how many midnights it is past the
 * column's first block.
 *
 * CalRow remaps displayed blocks to stored IDs (adjustBlockIDColumnID). When a
 * timezone change adds a column, the time blocks come back as
 * [after-midnight, before-midnight] groups, but a stored column runs
 * chronologically: its before-midnight blocks, then its after-midnight blocks,
 * which are on the next day.
 */
function getStoredBlockTimes(calendarFramework: calendarDimensions): {
  times: string[];
  dayOffsets: number[];
} {
  const groups = generateTimeBlocks(
    calendarFramework.startTime,
    calendarFramework.endTime
  );
  const extraDayAdded = calendarFramework.numOfCols !== getDates().length;
  const times =
    extraDayAdded && groups.length === 2
      ? [...groups[1].flat(), ...groups[0].flat()]
      : groups.flat(2);

  // A time label lower than the one before it means the column crossed midnight
  const dayOffsets: number[] = [];
  times.forEach((time, i) => {
    const prevOffset = i === 0 ? 0 : dayOffsets[i - 1];
    dayOffsets.push(i > 0 && time < times[i - 1] ? prevOffset + 1 : prevOffset);
  });

  return { times, dayOffsets };
}

/**
 * Start time of each stored block, in minutes after midnight of its column's
 * first day (so a 00:30 block past midnight is 1470, not 30). Consecutive
 * blocks of one continuous time range are exactly 15 apart.
 */
export function getBlockMinutes(calendarFramework: calendarDimensions): number[] {
  const { times, dayOffsets } = getStoredBlockTimes(calendarFramework);
  return times.map((time, i) => {
    const [hour, minute] = time.split(':').map(Number);
    return dayOffsets[i] * 24 * 60 + hour * 60 + minute;
  });
}

/**
 * Builds a pre-filled Google Calendar "create event" URL for the event.
 */
function createCalendarEventUrl(
  startDate: Date,
  endDate: Date,
  location: string | undefined
): string {
  const event = getEventObjectForGCal(startDate, endDate, location);
  const attendeesEmails = (event.attendees || [])
    .map((attendee: { email: string | undefined }) => attendee.email)
    .join(',');

  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${toGCalDateString(event.start.dateTime)}/${toGCalDateString(event.end.dateTime)}`,
    details: event.description,
    location: event.location || '',
    spropname: 'Add Event',
    add: attendeesEmails,
  });

  return `https://calendar.google.com/calendar/render?${queryParams.toString()}`;
}

/**
 * Turns a selection on the group calendar into the real start and end dates of
 * that meeting. Returns `{ error }` if it can't be read. Export and the best
 * time finder both use this, so what a suggestion shows is what gets exported.
 */
export function getSelectionDates(
  selection: BoundingBox | undefined,
  calendarFramework: calendarDimensions
): { start: Date; end: Date } | { error: string } {
  if (selection === undefined) {
    return { error: 'No new time selection made!' };
  }

  if (selection.left !== selection.right) {
    return { error: 'You must select times that occur on the same day!' };
  }

  // BoundingBox orders its corners, so upward drags need no special handling
  const startCol = selection.left;
  const startBlock = selection.top;
  const endBlock = selection.bottom;

  // Selection coordinates are stored column/block IDs. A stored column's first block is on
  // the date at the same index, even when a timezone change adds a column.
  const calDate = calendarFramework?.dates.flat()[startCol];
  const { times, dayOffsets } = getStoredBlockTimes(calendarFramework);
  if (!calDate?.date || !times[startBlock] || !times[endBlock]) {
    return { error: 'Could not read the selected time. Please select it again.' };
  }

  const [startHour, startMinute] = times[startBlock].split(':').map(Number);
  let [endHour, endMinute] = times[endBlock].split(':').map(Number);

  let startDate = new Date(calDate.date);
  if (startDate.getFullYear() === 2000) {
    startDate = getNextDayOccurrence(startDate.getDay());
  }
  startDate.setDate(startDate.getDate() + dayOffsets[startBlock]);
  startDate.setHours(startHour);
  startDate.setMinutes(startMinute);

  let endDate = new Date(calDate.date);
  if (endDate.getFullYear() === 2000) {
    endDate = getNextDayOccurrence(endDate.getDay());
  }
  endDate.setDate(endDate.getDate() + dayOffsets[endBlock]);

  // The end block's label is its start time; the event ends 15 minutes later.
  // setHours(24) correctly rolls over to midnight of the next day.
  endMinute += 15;
  if (endMinute === 60) {
    endMinute = 0;
    endHour += 1;
  }
  endDate.setHours(endHour);
  endDate.setMinutes(endMinute);

  return { start: startDate, end: endDate };
}

/**
 * Turns an admin's selection on the group calendar (`mostRecentSelection`) into
 * a Google Calendar event URL. Returns `{ error }` if it can't be exported.
 */
export function getGCalUrlForSelection(
  selection: BoundingBox | undefined,
  calendarFramework: calendarDimensions,
  location: string | undefined
): { url: string } | { error: string } {
  const dates = getSelectionDates(selection, calendarFramework);
  if ('error' in dates) {
    return dates;
  }
  return { url: createCalendarEventUrl(dates.start, dates.end, location) };
}

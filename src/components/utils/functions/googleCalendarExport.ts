import { calendarDimensions, dragProperties } from '../../../types';
import { getEventObjectForGCal } from '../../../backend/events';
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
 * Turns an admin's drag selection on the group calendar into a Google Calendar
 * event URL. Returns `{ error }` if the selection can't be exported.
 */
export function getGCalUrlForSelection(
  dragState: dragProperties,
  calendarFramework: calendarDimensions,
  location: string | undefined
): { url: string } | { error: string } {
  if (!dragState.endPoint || !dragState.startPoint) {
    return { error: 'No new time selection made!' };
  }

  const [startCol, rawStartBlock] = dragState.startPoint;
  const [endCol, rawEndBlock] = dragState.endPoint;

  if (startCol !== endCol) {
    return { error: 'You must select times that occur on the same day!' };
  }

  // Dragging upward puts the end point above the start point
  const startBlock = Math.min(rawStartBlock, rawEndBlock);
  const endBlock = Math.max(rawStartBlock, rawEndBlock);

  const calDate = calendarFramework?.dates.flat()[startCol];
  const times = generateTimeBlocks(
    calendarFramework?.startTime,
    calendarFramework?.endTime
  ).flat(2);

  const [startHour, startMinute] = times[startBlock].split(':').map(Number);
  let [endHour, endMinute] = times[endBlock]
    ? times[endBlock].split(':').map(Number)
    : [0, 0];

  let startDate = new Date(calDate?.date!);
  if (startDate.getFullYear() === 2000) {
    startDate = getNextDayOccurrence(startDate.getDay());
  }
  startDate.setHours(startHour);
  startDate.setMinutes(startMinute);

  let endDate = new Date(calDate?.date!);
  if (endDate.getFullYear() === 2000) {
    endDate = getNextDayOccurrence(endDate.getDay());
  }

  // The end block's label is its start time; the event ends 15 minutes later.
  // setHours(24) correctly rolls over to midnight of the next day.
  endMinute += 15;
  if (endMinute === 60) {
    endMinute = 0;
    endHour += 1;
  }
  endDate.setHours(endHour);
  endDate.setMinutes(endMinute);

  return { url: createCalendarEventUrl(startDate, endDate, location) };
}

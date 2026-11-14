import { calendar_v3 } from 'googleapis';

/**
 * The number of minutes that a single calendar block represents.
 */
export const MINUTES_PER_BLOCK = 15;

/**
 * Given an event from the API, extracts relevant details. Interprets `.summary` properties as
 * event names; if the property is missing, defaults to `null`. Returns `undefined` if start or
 * end date strings are missing or are not valid according to `Date.parse`.
 *
 * @param event - An event from the API.
 * @returns The event's name, start time, and end time.
 */
export function parse(
  event: calendar_v3.Schema$Event
): GoogleCalendarEvent | undefined {
  if (!event.start?.dateTime || !event.end?.dateTime) {
    return undefined;
  }
  const name = event.summary || null;
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  if (isNaN(start.valueOf()) || isNaN(end.valueOf())) {
    return undefined;
  }
  return { name, start, end };
}

/**
 * Converts a 24-hour HH:MM string to the number of minutes since 00:00. Makes no guarantees for
 * invalid time strings.
 *
 * @param timeString - A 24-hours HH:MM string representing a time.
 * @returns The number of full minutes passed since 00:00.
 */
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Finds the number of minutes between a Date object and that day's 00:00 in local time.
 *
 * @param date - Any Date.
 * @returns In local time, the number of minutes since the start of the day.
 */
function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Determines whether two Dates occur on the same calendar day in local time.
 */
export function areSameDate(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Basic details about an event.
 */
export interface GoogleCalendarEvent {
  /**
   * The name of the event. null if the name is missing.
   */
  name: string | null;
  /**
   * The date and time at which the event starts.
   */
  start: Date;
  /**
   * The date and time at which the event ends.
   */
  end: Date;
}

/**
 * Determines whether a block overlaps with an event. Exclusive on both
 * ends of the event.
 *
 * @remarks
 * Specifically, true if the block starts strictly before the event ends and ends strictly after
 * the event starts.
 *
 * @param event - An event on the same day as the block.
 * @param blockStartMinutes - The time at which the block starts in minutes since 00:00, local time.
 * @param blockDurationMinutes - The length of the block in minutes.
 */
export function doesBlockOverlapEvent(
  event: GoogleCalendarEvent,
  blockStartMinutes: number,
  blockDurationMinutes: number
): boolean {
  const blockEndMinutes = blockStartMinutes + blockDurationMinutes;

  const eventStartMinutes = dateToMinutes(event.start);
  const eventEndMinutes = dateToMinutes(event.end);

  return (
    blockStartMinutes < eventEndMinutes && blockEndMinutes > eventStartMinutes
  );
}

/**
 * Determines whether an event starts in a block. The event and block must be from the same day.
 * It is reasonable to outline the top of the block (to denote the start of an event) if and only
 * if this method returns `true`.
 *
 * @remarks
 * Containment is inclusive at the block's start and exclusive at its end.
 */
export function doesEventStartInBlock(
  eventStart: Date,
  blockStartMinutes: number,
  blockDurationMinutes: number
): boolean {
  const timeMinutes = dateToMinutes(eventStart);

  const timeDifference = timeMinutes - blockStartMinutes;
  return timeDifference >= 0 && timeDifference < blockDurationMinutes;
}

/**
 * Determines whether an event ends in a block. The event and block must be from the same day.
 * It is reasonable to outline the bottom of the block (to denote the end of an event) if and only
 * if this method returns `true`.
 *
 * @remarks
 * Containment is inclusive at the block's end and exclusive at its start.
 */
export function doesEventEndInBlock(
  eventEnd: Date,
  blockStartMinutes: number,
  blockDurationMinutes: number
): boolean {
  const timeMinutes = dateToMinutes(eventEnd);

  const timeDifference = timeMinutes - blockStartMinutes;
  return timeDifference > 0 && timeDifference <= blockDurationMinutes;
}

/**
 * Determines whether a given time is contained (exclusive) within any event.
 *
 * @param date - Any Date object.
 * @param events - Some events to test containment with.
 */
export function isInAnyEvent(
  time: Date,
  events: readonly GoogleCalendarEvent[]
): boolean {
  return events.some((event) => event.start < time && event.end > time);
}

/**
 * Determines whether a calendar block on a given day overlaps with any of the raw API events.
 * Events without a parseable start and end time (e.g. all-day events) are ignored.
 *
 * @param events - Raw events from the API.
 * @param blockTime - The block's start as a 24-hour HH:MM string.
 * @param blockDate - The day the block is on.
 * @param blockDurationMinutes - The length of the block in minutes.
 */
export function doesBlockOverlapAnyEvent(
  events: readonly calendar_v3.Schema$Event[],
  blockTime: string,
  blockDate: Date,
  blockDurationMinutes: number
): boolean {
  const blockStartMinutes = timeToMinutes(blockTime);
  return events.some((raw) => {
    const event = parse(raw);
    return (
      event !== undefined &&
      areSameDate(event.start, blockDate) &&
      doesBlockOverlapEvent(event, blockStartMinutes, blockDurationMinutes)
    );
  });
}

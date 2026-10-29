import {
  BoundingBox,
  DraggedSelection,
  calendarDate,
  calendarDimensions,
  calendarState,
  userData,
} from '../../types';
import { calendar_v3 } from 'googleapis';
import CalBlock from './CalBlock';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import { getDates } from '../../backend/events';

/**
 * The number of minutes that a single calendar block represents.
 */
const MINUTES_PER_BLOCK = 15;

/**
 * The properties needed to render a CalRow.
 */
interface CalRowProps {
  bucket: calendarDate[];
  theCalendarState: [
    calendarState,
    React.Dispatch<React.SetStateAction<calendarState>>,
  ];
  draggable: boolean;
  isAdmin?: boolean;
  chartedUsersData:
    [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined;
  user: number;
  columnIndexOffSet: number;
  blockID: number;
  is30Minute: boolean;
  theDragState: [
    DraggedSelection | undefined,
    React.Dispatch<React.SetStateAction<DraggedSelection | undefined>>,
  ];
  theMostRecentSelection: [
    BoundingBox | undefined,
    React.Dispatch<React.SetStateAction<BoundingBox | undefined>>,
  ];
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  borderStyle?: string;
  theGoogleCalendarEvents:
    | [
        calendar_v3.Schema$Event[],
        React.Dispatch<React.SetStateAction<calendar_v3.Schema$Event[]>>,
      ]
    | undefined;
  time: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined;
  groupIndex: number;
}

/**
 * Information about a single block on calendar.
 */
interface CalBlockData {
  isOnGcal: boolean;
  eventNames: (string | null)[];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventName: string | null;
  additionalEventCount: number;
  adjustedBlockID: number;
  adjustedColumnID: number;
  isDraggable: boolean;
}

/**
 * One row of a calendar grid. Mostly just constructs and forwards properties to calendar blocks,
 * but also computes information related to imported Google Calendar events so the blocks can be
 * highlighted, bordered, and labeled appropriately.
 */
export default function CalRow({
  bucket,
  theCalendarState,
  isAdmin,
  draggable,
  user,
  columnIndexOffSet,
  theCalendarFramework,
  blockID,
  is30Minute,
  theDragState,
  theMostRecentSelection,
  chartedUsersData,
  theGoogleCalendarEvents,
  time,
  onClick,
  groupIndex,
}: CalRowProps) {
  const [googleCalendarEvents] = theGoogleCalendarEvents || [];
  const [calendarFramework] = theCalendarFramework;

  /**
   * Adjusts blockID and columnID based on timezone canges and potential new colmns added for new days.
   */
  function adjustBlockIDColumnID(
    groupIndex: number,
    blockID: number,
    columnIndex: number,
    numOfCols: number,
    originalNumOfCols: number
  ): [number, number] {
    const timeBlocks = generateTimeBlocks(
      calendarFramework.startTime,
      calendarFramework.endTime
    );
    const extraDayAdded = numOfCols != originalNumOfCols;

    if (extraDayAdded) {
      const upperBlocksPerColumn = timeBlocks[0] ? timeBlocks[0].length * 4 : 0;
      const lowerBlocksPerColumn = timeBlocks[1] ? timeBlocks[1].length * 4 : 0;

      if (groupIndex === 0) {
        if (columnIndex === 0) {
          return [-1, -1];
        }
        return [blockID + lowerBlocksPerColumn, columnIndex - 1];
      } else {
        if (columnIndex >= originalNumOfCols) {
          return [-1, -1];
        }
        return [blockID - upperBlocksPerColumn, columnIndex];
      }
    }

    return [blockID, columnIndex];
  }

  /**
   * Computes pertinent information about calendar blocks, accounting for contextual information
   * like the calendar's dimensions and the row's group.
   */
  function computeCalBlockData(
    date: calendarDate,
    columnIndex: number
  ): CalBlockData {
    const {
      isOnGcal,
      events,
      isEventStart,
      isEventEnd,
      eventStartingOnBlock,
      additionalEventCount,
    } = determineCalendarEventsForBlock(
      googleCalendarEvents ? googleCalendarEvents : [],
      date.date ? date.date : new Date(),
      timeToMinutes(time)
    );
    const [adjustedBlockID, adjustedColumnID] = adjustBlockIDColumnID(
      groupIndex,
      blockID,
      columnIndex + columnIndexOffSet,
      theCalendarFramework[0].numOfCols,
      getDates().length
    );

    const isDraggable = adjustedBlockID >= 0 && draggable;
    const eventNames = events.map((event) => event.name);

    return {
      isOnGcal,
      eventNames,
      isEventStart,
      isEventEnd,
      eventName: eventStartingOnBlock,
      additionalEventCount,
      adjustedBlockID,
      adjustedColumnID,
      isDraggable,
    };
  }
  return (
    <div className={`grid grid-cols-${bucket.length}`}>
      {bucket.map((date: calendarDate, columnIndex: number) => {
        const blockData = computeCalBlockData(date, columnIndex);

        return (
          <CalBlock
            key={columnIndex + columnIndexOffSet}
            onClick={onClick}
            theCalendarFramework={theCalendarFramework}
            is30Minute={is30Minute}
            theCalendarState={theCalendarState}
            blockID={blockData.adjustedBlockID}
            columnID={blockData.adjustedColumnID}
            isAdmin={isAdmin}
            draggable={blockData.isDraggable}
            user={user}
            theDragState={theDragState}
            theMostRecentSelection={theMostRecentSelection}
            chartedUsersData={chartedUsersData}
            isOnGcal={blockData.isOnGcal}
            eventNames={blockData.eventNames}
            isEventStart={blockData.isEventStart}
            isEventEnd={blockData.isEventEnd}
            eventStartingOnBlock={blockData.eventName}
            additionalEventCount={blockData.additionalEventCount}
          />
        );
      })}
    </div>
  );
}

/**
 * Events that overlap, start on, or end on a calendar block.
 */
interface BlockEventOverlap {
  isOnGcal: boolean;
  events: Event[];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventStart: Event | null;
  eventStartingOnBlock: string | null;
  additionalEventCount: number;
}

/**
 * Finds Google Calendar events that overlap, start in, or end in a calendar block.
 *
 * @param googleCalendarEvents - A list of all Google Calendar events to be examined.
 * @param date - The block's date. Events not on this date will be ignored.
 * @param blockStartMinutes - The number of minutes between 00:00 local time and the block's start.
 * @returns Calendar events overlapping the block and summary statistics about them.
 */
function determineCalendarEventsForBlock(
  googleCalendarEvents: calendar_v3.Schema$Event[],
  date: Date,
  blockStartMinutes: number
): BlockEventOverlap {
  // Filter events for the target date
  const rawSameDayEvents = googleCalendarEvents.filter((event) => {
    if (!event.start?.dateTime) return false;
    const eventDate = new Date(event.start.dateTime);
    return areSameDate(eventDate, date);
  });
  // TODO: Remove the cast after upgrading Typescript
  const sameDayEvents = rawSameDayEvents
    .map(parse)
    .filter((event) => event !== undefined) as Event[];

  const overlappingEvents = sameDayEvents.filter((event) =>
    doesBlockOverlapEvent(event, blockStartMinutes)
  );

  const eventsStartingInBlock = sameDayEvents.filter((event) =>
    doesEventStartInBlock(event.start, blockStartMinutes)
  );

  const eventsEndingInBlock = sameDayEvents.filter(
    (event) =>
      doesEventEndInBlock(event.end, blockStartMinutes) &&
      -!isInAnyEvent(event.end, sameDayEvents)
  );

  const eventStart = eventsStartingInBlock[0] || null;

  return {
    isOnGcal: overlappingEvents.length > 0,
    events: overlappingEvents,
    isEventStart: eventsStartingInBlock.length > 0,
    isEventEnd: eventsEndingInBlock.length > 0,
    eventStart,
    eventStartingOnBlock: eventStart?.name || null,
    additionalEventCount: Math.max(0, eventsStartingInBlock.length - 1),
  };
}

/**
 * Given an event from the API, extracts relevant details. Interprets `.summary` properties as
 * event names; if the property is missing, defaults to `null`. Returns `undefined` if start or
 * end date strings are missing or are not valid according to `Date.parse`.
 *
 * @param event - An event from the API.
 * @returns The event's name, start time, and end time.
 */
export function parse(event: calendar_v3.Schema$Event): Event | undefined {
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
export function dateToMinutes(date: Date): number {
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
interface Event {
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
 * the event starts. Assumes the block starts
 *
 * @param event - An event on the same day as the block.
 * @param blockStartMinutes - The time at which the block starts in minutes since 00:00, local time.
 * @param blockDurationMinutes - The length of the block in minutes.
 */
export function doesBlockOverlapEvent(
  event: Event,
  blockStartMinutes: number,
  blockDurationMinutes: number = MINUTES_PER_BLOCK
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
 * "Starts in a block" means that the start of the event and at least one non-start time in the
 * event are within the block's bounds, inclusive.
 */
export function doesEventStartInBlock(
  eventStart: Date,
  blockStartMinutes: number,
  blockDurationMinutes: number = MINUTES_PER_BLOCK
): boolean {
  const timeMinutes = dateToMinutes(eventStart);

  const timeDifference = timeMinutes - blockStartMinutes;
  return timeDifference >= 0 && timeDifference < blockDurationMinutes;
}

/**
 * Determines whether an event ends in a block. The event and block must be from the same day.
 * If its reasonable to outline the bottom of the block (to denote the end of an event) if and only
 * if this method returns `true`.
 *
 * @remarks
 * "Ends in a block" means that the end of the event and at least one non-end time in the event are
 * are within the block's bounds, inclusive.
 */
export function doesEventEndInBlock(
  eventEnd: Date,
  blockStartMinutes: number,
  blockDurationMinutes: number = MINUTES_PER_BLOCK
): boolean {
  const timeMinutes = dateToMinutes(eventEnd);

  const timeDifference = timeMinutes - blockStartMinutes;
  return timeDifference > 0 && timeDifference <= blockDurationMinutes;
}

/**
 * Determines whether a given time is contained (exclusive) within any event.
 *
 * @param - Any Date object.
 * @param - Some events to test containment with.
 */
export function isInAnyEvent(time: Date, events: readonly Event[]): boolean {
  return events.some((event) => event.start < time && event.end > time);
}

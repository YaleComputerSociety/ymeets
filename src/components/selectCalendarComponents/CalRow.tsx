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

const MINUTES_PER_BLOCK = 15;

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

interface CalBlockData {
  isOnGcal: boolean;
  events: calendar_v3.Schema$Event[] | undefined;
  isEventStart: boolean;
  isEventEnd: boolean;
  eventName: string | null;
  additionalEventCount: number;
  adjustedBlockID: number;
  adjustedColumnID: number;
  isDraggable: boolean;
}

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

  // adjusts blockID and columnID based on timezone canges and potential new colmns added for new days
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

  function computeCalBlockData(
    date: calendarDate,
    columnIndex: number
  ): CalBlockData {
    const {
      isOnGcal,
      events,
      isEventStart,
      isEventEnd,
      eventName,
      additionalEventCount,
    } = analyzeCalendarBlock(
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

    return {
      isOnGcal,
      events,
      isEventStart,
      isEventEnd,
      eventName,
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
            associatedEvents={blockData.events}
            isEventStart={blockData.isEventStart}
            isEventEnd={blockData.isEventEnd}
            eventName={blockData.eventName}
            additionalEventCount={blockData.additionalEventCount}
          />
        );
      })}
    </div>
  );
}

export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function areSameDate(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

interface EventTimes {
  start: Date;
  end: Date;
}

function extractTimes(event: calendar_v3.Schema$Event): EventTimes | undefined {
  if (!event.start?.dateTime || !event.end?.dateTime) {
    return undefined;
  }
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  return { start, end };
}

export function isTimeInEvent(
  event: EventTimes | undefined,
  blockStartMinutes: number,
  targetDate: Date
): boolean {
  if (event === undefined) {
    return false;
  }

  // Only check events on the target date
  if (!areSameDate(event.start, targetDate)) return false;

  const blockEndMinutes = blockStartMinutes + MINUTES_PER_BLOCK;

  const eventStartMinutes = dateToMinutes(event.start);
  const eventEndMinutes = dateToMinutes(event.end);

  return (
    blockStartMinutes < eventEndMinutes && blockEndMinutes > eventStartMinutes
  );
}

export function isTimeInBlock(
  time: Date | undefined,
  blockStartMinutes: number,
  blockDurationMinutes: number = MINUTES_PER_BLOCK
): boolean {
  if (time === undefined) {
    return false;
  }

  const timeMinutes = dateToMinutes(time);

  const timeDifference = timeMinutes - blockStartMinutes;
  return timeDifference >= 0 && timeDifference < blockDurationMinutes;
}

export function isInAnyEvent(
  time: Date | undefined,
  events: readonly (EventTimes | undefined)[]
): boolean {
  if (time === undefined) {
    return false;
  }

  return events.some((event) => {
    if (event === undefined) {
      return false;
    }
    return event.start < time && event.end > time;
  });
}

interface BlockInfo {
  isOnGcal: boolean;
  eventCount: number;
  events: calendar_v3.Schema$Event[];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventStart: calendar_v3.Schema$Event | null;
  eventEnd: calendar_v3.Schema$Event | null;
  eventName: string | null;
  additionalEventCount: number;
}

function analyzeCalendarBlock(
  googleCalendarEvents: calendar_v3.Schema$Event[],
  date: Date,
  blockStartMinutes: number
): BlockInfo {
  // Filter events for the target date
  const dayEvents = googleCalendarEvents.filter((event) => {
    if (!event.start?.dateTime) return false;
    const eventDate = new Date(event.start.dateTime);
    return areSameDate(eventDate, date);
  });
  const eventTimes = dayEvents.map(extractTimes);

  // Find events that overlap with this block
  const overlappingEvents = dayEvents.filter((_, i) =>
    isTimeInEvent(eventTimes[i], blockStartMinutes, date)
  );

  // Find events starting near this time
  const eventsStartingInBlock = dayEvents.filter((_, i) =>
    isTimeInBlock(eventTimes[i]?.start, blockStartMinutes)
  );

  const eventsEndingInBlock = dayEvents.filter(
    (_, i) =>
      isTimeInBlock(eventTimes[i]?.end, blockStartMinutes) &&
      !isInAnyEvent(eventTimes[i]?.end, eventTimes)
  );

  const eventStart = eventsStartingInBlock[0] || null;
  const eventEnd = eventsEndingInBlock[0] || null;

  return {
    isOnGcal: overlappingEvents.length > 0,
    eventCount: overlappingEvents.length,
    events: overlappingEvents,
    isEventStart: eventsStartingInBlock.length > 0,
    isEventEnd: eventsEndingInBlock.length > 0,
    eventStart,
    eventEnd,
    eventName: eventStart?.summary || null,
    additionalEventCount: Math.max(0, eventsStartingInBlock.length - 1),
  };
}

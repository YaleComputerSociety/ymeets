import {
  calandarDate,
  calendarDimensions,
  calanderState,
  userData,
} from '../../types';
import { calendar_v3 } from 'googleapis';
import CalBlock from './CalBlock';
import { dragProperties } from '../../types';
import { dateObjectToComparable } from '../utils/functions/dateObjecToComparable';
import { isTimeBetweenDates } from '../utils/functions/isTimeBetweenDates';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import { getDates } from '../../backend/events';
import { over } from 'lodash';

interface CalRowProps {
  bucket: calandarDate[];
  theCalendarState: [
    calanderState,
    React.Dispatch<React.SetStateAction<calanderState>>,
  ];
  draggable: boolean;
  isAdmin?: boolean;
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  user: number;
  columnIndexOffSet: number;
  blockID: number;
  blockIDOffset: number;
  is30Minute: boolean;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
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
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    | undefined;
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
  blockIDOffset,
  is30Minute,
  theDragState,
  chartedUsersData,
  theGoogleCalendarEvents,
  time,
  onClick,
  groupIndex,
}: CalRowProps) {
  const [googleCalendarEvents, setGoogleCalendarEvents] =
    theGoogleCalendarEvents || [];
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

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

  function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  function isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  function isTimeInEvent(
    event: calendar_v3.Schema$Event,
    timeString: string,
    targetDate: Date
  ): boolean {
    if (!event.start?.dateTime || !event.end?.dateTime) return false;

    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);

    // Only check events on the target date
    if (!isSameDate(startTime, targetDate)) return false;

    const blockStartMinutes = timeToMinutes(timeString);
    const blockEndMinutes = blockStartMinutes + 15; // 15-minute blocks

    const eventStartMinutes = dateToMinutes(startTime);
    const eventEndMinutes = dateToMinutes(endTime);

    // Block overlaps with event if any part of the 15-minute block intersects with the event
    // Use <= for event end to include blocks that start exactly when event ends
    return (
      blockStartMinutes <= eventEndMinutes &&
      blockEndMinutes > eventStartMinutes
    );
  }

  function isEventStartingNear(
    event: calendar_v3.Schema$Event,
    timeString: string,
    toleranceMinutes = 14
  ): boolean {
    if (!event.start?.dateTime) return false;

    const startTime = new Date(event.start.dateTime);
    const eventStartMinutes = dateToMinutes(startTime);
    const blockStartMinutes = timeToMinutes(timeString);

    const timeDifference = Math.abs(eventStartMinutes - blockStartMinutes);
    return timeDifference <= toleranceMinutes;
  }

  function isEventEndingNear(
    event: calendar_v3.Schema$Event,
    timeString: string,
    toleranceMinutes = 14
  ): boolean {
    if (!event.end?.dateTime) return false;

    const endTime = new Date(event.end.dateTime);
    const eventEndMinutes = dateToMinutes(endTime);
    const blockStartMinutes = timeToMinutes(timeString);

    const timeDifference = Math.abs(eventEndMinutes - blockStartMinutes);
    return timeDifference <= toleranceMinutes;
  }

  function hasOverlappingEvent(
    targetEvent: calendar_v3.Schema$Event,
    allEvents: calendar_v3.Schema$Event[]
  ): boolean {
    if (!targetEvent.start?.dateTime || !targetEvent.end?.dateTime)
      return false;

    const targetStart = new Date(targetEvent.start.dateTime);
    const targetEnd = new Date(targetEvent.end.dateTime);

    return allEvents.some((event) => {
      if (
        event === targetEvent ||
        !event.start?.dateTime ||
        !event.end?.dateTime
      )
        return false;

      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Check if other event overlaps with target event's end time
      return eventStart < targetEnd && eventEnd > targetEnd;
    });
  }

  function analyzeCalendarBlock(
    googleCalendarEvents: calendar_v3.Schema$Event[],
    date: Date,
    time: string
  ): BlockInfo {
    // Filter events for the target date
    const dayEvents = googleCalendarEvents.filter((event) => {
      if (!event.start?.dateTime) return false;
      const eventDate = new Date(event.start.dateTime);
      return isSameDate(eventDate, date);
    });

    // Find events that overlap with this 15-minute block
    const overlappingEvents = dayEvents.filter((event) =>
      isTimeInEvent(event, time, date)
    );

    // Find events starting near this time
    const startingEvents = dayEvents.filter((event) =>
      isEventStartingNear(event, time)
    );

    // Find events ending near this time (excluding overlapped ones)
    const endingEvents = dayEvents.filter(
      (event) =>
        isEventEndingNear(event, time) && !hasOverlappingEvent(event, dayEvents)
    );

    const eventStart = startingEvents[0] || null;
    const eventEnd = endingEvents[0] || null;

    return {
      isOnGcal: overlappingEvents.length > 0,
      eventCount: overlappingEvents.length,
      events: overlappingEvents,
      isEventStart: startingEvents.length > 0,
      isEventEnd: endingEvents.length > 0,
      eventStart,
      eventEnd,
      eventName: eventStart?.summary || null,
      additionalEventCount: Math.max(0, startingEvents.length - 1),
    };
  }

  function computeCalBlockData(
    date: calandarDate,
    columnIndex: number
  ): CalBlockData {
    const {
      isOnGcal,
      events,
      eventCount,
      isEventStart,
      isEventEnd,
      eventName,
      additionalEventCount,
    } = analyzeCalendarBlock(
      googleCalendarEvents ? googleCalendarEvents : [],
      date.date ? date.date : new Date(),
      time
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
      {bucket.map((date: calandarDate, columnIndex: number) => {
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

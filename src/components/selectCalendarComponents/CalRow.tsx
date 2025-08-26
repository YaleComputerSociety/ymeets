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
  surroundingEvents: calendar_v3.Schema$Event[] | undefined;
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

  function computeCalBlockData(
    date: calandarDate,
    columnIndex: number
  ): CalBlockData {
    const matchedEvents = googleCalendarEvents?.filter(
      (gEvent: calendar_v3.Schema$Event) =>
        gEvent?.start?.dateTime &&
        dateObjectToComparable(new Date(gEvent.start.dateTime)) ===
          dateObjectToComparable(date.date)
    );

    const matchedDates = googleCalendarEvents
      ?.map((gEvent: calendar_v3.Schema$Event) => {
        if (gEvent?.start?.dateTime && gEvent?.end?.dateTime) {
          return [
            new Date(gEvent.start.dateTime),
            new Date(gEvent.end.dateTime),
          ];
        }
        return null;
      })
      ?.filter(
        (dates: Date[] | null) =>
          dates !== null &&
          dateObjectToComparable(dates[0]) === dateObjectToComparable(date.date)
      );

    const isOnGcal =
      matchedDates?.some((dateRange) =>
        isTimeBetweenDates(dateRange?.[0], dateRange?.[1], time)
      ) ?? false;

    const surroundingEvents = matchedEvents?.filter(
      (gEvent: calendar_v3.Schema$Event) =>
        gEvent?.start?.dateTime &&
        gEvent?.end?.dateTime &&
        isTimeBetweenDates(
          new Date(gEvent?.start?.dateTime),
          new Date(gEvent?.end?.dateTime),
          time
        )
    );

    const [hours, minutes] = time.split(':').map(Number);

    const eventStartMatches = matchedEvents?.filter(
      (gEvent: calendar_v3.Schema$Event) => {
        if (gEvent?.start?.dateTime) {
          const startTime = new Date(gEvent.start.dateTime);
          const checkTime = new Date(gEvent.start.dateTime);
          checkTime.setHours(hours, minutes, 0, 0);
          const timeDifference = checkTime.getTime() - startTime.getTime();
          return timeDifference >= 0 && timeDifference <= 14 * 60 * 1000;
        }
        return false;
      }
    );

    const eventEndMatches = matchedEvents?.filter(
      (gEvent: calendar_v3.Schema$Event) => {
        const [hours, minutes] = time.split(':').map(Number);
        if (gEvent?.end?.dateTime) {
          const endTime = new Date(gEvent.end.dateTime);
          const checkTime = new Date(gEvent.end.dateTime);
          checkTime.setHours(hours, minutes, 0, 0);
          const timeDifference = endTime.getTime() - checkTime.getTime();

          const isOverlapped = matchedEvents?.some(
            (otherEvent) =>
              otherEvent !== gEvent &&
              otherEvent.end?.dateTime &&
              new Date(otherEvent.end.dateTime) > endTime &&
              otherEvent.start?.dateTime &&
              new Date(otherEvent.start.dateTime) < endTime
          );

          return (
            !isOverlapped &&
            timeDifference >= 0 &&
            timeDifference <= 14 * 60 * 1000
          );
        }
        return false;
      }
    );

    const eventStart = eventStartMatches?.[0] || null;
    const eventEnd = eventEndMatches?.[0] || null;
    const isEventStart = !!eventStart;
    const isEventEnd = !!eventEnd;
    const eventName = eventStart?.summary || null;
    const additionalEventCount =
      eventStartMatches && eventStartMatches.length > 1
        ? eventStartMatches.length - 1
        : 0;

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
      surroundingEvents,
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
            associatedEvents={blockData.surroundingEvents}
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

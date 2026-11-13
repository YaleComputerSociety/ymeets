import {
  BoundingBox,
  DraggedSelection,
  calendarDate,
  calendarDimensions,
  calendarState,
  userData,
} from '../../types';
import { calendar_v3 } from 'googleapis';
import { useState } from 'react';
import CalBlock from './CalBlock';
import {
  GoogleCalendarEvent,
  MINUTES_PER_BLOCK,
  areSameDate,
  doesBlockOverlapEvent,
  doesEventEndInBlock,
  doesEventStartInBlock,
  isInAnyEvent,
  parse,
  timeToMinutes,
} from '../utils/functions/eventFiltering';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import { getDates } from '../../backend/events';

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
  calendarFramework: calendarDimensions;
  borderStyle?: string;
  googleCalendarEvents: calendar_v3.Schema$Event[];
  time: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined;
  groupIndex: number;
  maxUsers: number;
}

/**
 * Information about a single block on calendar.
 */
interface CalBlockData {
  isOnGcal: boolean;
  eventNames: (string | null)[];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventStartingOnBlock: string | null;
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
  calendarFramework,
  blockID,
  is30Minute,
  theDragState,
  theMostRecentSelection,
  chartedUsersData,
  googleCalendarEvents,
  time,
  onClick,
  groupIndex,
  maxUsers,
}: CalRowProps) {
  // TODO: remove this cast after upgrading Typescript
  const parsedGoogleCalendarEvents = googleCalendarEvents
    .map(parse)
    .filter((e) => e !== undefined) as GoogleCalendarEvent[];
  // Intentionally stale when the date changes. Users won't expect calendar events to move around without a page reload.
  const [currentDate] = useState<Date>(() => new Date());

  /**
   * Adjusts blockID and columnID based on timezone changes and potential new columns added for new days.
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
      parsedGoogleCalendarEvents,
      date.date ? date.date : currentDate,
      timeToMinutes(time)
    );
    const [adjustedBlockID, adjustedColumnID] = adjustBlockIDColumnID(
      groupIndex,
      blockID,
      columnIndex + columnIndexOffSet,
      calendarFramework.numOfCols,
      getDates().length
    );

    const isDraggable = adjustedBlockID >= 0 && draggable;
    const eventNames = events.map((event) => event.name);

    return {
      isOnGcal,
      eventNames,
      isEventStart,
      isEventEnd,
      eventStartingOnBlock: eventStartingOnBlock,
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
            calendarFramework={calendarFramework}
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
            eventStartingOnBlock={blockData.eventStartingOnBlock}
            additionalEventCount={blockData.additionalEventCount}
            maxUsers={maxUsers}
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
  events: GoogleCalendarEvent[];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventStartingOnBlock: string | null;
  additionalEventCount: number;
}

/**
 * Finds Google Calendar events that overlap, start in, or end in a calendar block.
 *
 * @param events - A list of all Google Calendar events to be examined.
 * @param date - The block's date. Events not on this date will be ignored.
 * @param blockStartMinutes - The number of minutes between 00:00 local time and the block's start.
 * @returns Calendar events overlapping the block and summary statistics about them.
 */
function determineCalendarEventsForBlock(
  events: GoogleCalendarEvent[],
  date: Date,
  blockStartMinutes: number
): BlockEventOverlap {
  const sameDayEvents = events.filter((event) =>
    areSameDate(event.start, date)
  );

  const overlappingEvents = sameDayEvents.filter((event) =>
    doesBlockOverlapEvent(event, blockStartMinutes, MINUTES_PER_BLOCK)
  );

  const eventsStartingInBlock = sameDayEvents.filter((event) =>
    doesEventStartInBlock(event.start, blockStartMinutes, MINUTES_PER_BLOCK)
  );

  const isEventEnd = sameDayEvents.some(
    (event) =>
      doesEventEndInBlock(event.end, blockStartMinutes, MINUTES_PER_BLOCK) &&
      !isInAnyEvent(event.end, sameDayEvents)
  );

  const eventStart = eventsStartingInBlock[0] ?? null;

  return {
    isOnGcal: overlappingEvents.length > 0,
    events: overlappingEvents,
    isEventStart: eventsStartingInBlock.length > 0,
    isEventEnd,
    eventStartingOnBlock: eventStart?.name ?? null,
    additionalEventCount: Math.max(0, eventsStartingInBlock.length - 1),
  };
}

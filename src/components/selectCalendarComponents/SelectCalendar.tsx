import { 
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useMemo,
  useState,
  } from 'react';
import { calendar_v3 } from 'googleapis';
import 'tailwindcss/tailwind.css';
import {
  BoundingBox,
  DraggedSelection,
  calendarDate,
  calendarDimensions,
  calendarState,
  userData,
} from '../../types';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import CalRow from './CalRow';
import DateBar from './DateBar';
import { useRef } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';

interface SelectCalendarProps {
  theCalendarState: [
    calendarState,
    Dispatch<SetStateAction<calendarState>>,
  ];
  chartedUsersData:
    | [userData, Dispatch<SetStateAction<userData>>]
    | undefined;
  draggable: boolean;
  isAdmin?: boolean;
  bucket: calendarDate[];
  columnIndexOffset: number;
  user: number;
  startDate: Date;
  endDate: Date;
  renderTime: boolean;
  theDragState: [
    DraggedSelection | undefined,
    Dispatch<SetStateAction<DraggedSelection | undefined>>,
  ];
  theMostRecentSelection: [
    BoundingBox | undefined,
    Dispatch<SetStateAction<BoundingBox | undefined>>
  ]
  calendarFramework: calendarDimensions;
  googleCalendarEvents: calendar_v3.Schema$Event[],
  onClick: MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    | [boolean, Dispatch<SetStateAction<boolean>>]
    | undefined;
  isGeneralDays: boolean;
  setChartedUsers?: Dispatch<SetStateAction<userData>>;
  chartedUsers?: userData;
}

/**
 * Returns the most participants free in any single block, counting only the
 * shown participants (all of them when `shownUserIds` is null). The group
 * calendar uses it as the darkest shade.
 */
function getMaxAvailableCount(
  calendarState: calendarState,
  shownUserIds: Set<number> | null
): number {
  let maxCount = 0;
  const counts: number[][] = [];

  for (let i = 0; i < calendarState.length; i++) {
    if (shownUserIds && !shownUserIds.has(i)) continue;
    for (let j = 0; j < calendarState[i].length; j++) {
      if (!counts[j]) counts[j] = [];
      for (let k = 0; k < calendarState[i][j].length; k++) {
        if (calendarState[i][j][k]) {
          const newVal = (counts[j][k] ?? 0) + 1;
          counts[j][k] = newVal;
          if (newVal > maxCount) maxCount = newVal;
        }
      }
    }
  }
  return maxCount;
}

function SelectCalendar({
  theCalendarState,
  chartedUsersData,
  calendarFramework,
  draggable,
  isAdmin,
  bucket,
  columnIndexOffset,
  user,
  startDate,
  endDate,
  theDragState,
  theMostRecentSelection,
  googleCalendarEvents,
  onClick,
  theShowUserChart,
  isGeneralDays,
  setChartedUsers,
  chartedUsers,
}: SelectCalendarProps) {
  const [timeBlocks, setTimeBlocks] = useState<string[][][]>(
    generateTimeBlocks(startDate, endDate)
  );

  useEffect(() => {
    setTimeBlocks(generateTimeBlocks(startDate, endDate));
  }, [startDate, endDate]);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Computed once here rather than in every CalBlock. The shown participants are
  // keyed as a string so hovering (which rebuilds chartedUsers) doesn't trigger a recount.
  const calendarStateValue = theCalendarState[0];
  const shownUserIdsKey = chartedUsersData?.[0]?.users
    ?.map((u) => u.id)
    .join(',');
  const maxUsers = useMemo(
    () =>
      getMaxAvailableCount(
        calendarStateValue,
        shownUserIdsKey !== undefined
          ? new Set(shownUserIdsKey.split(',').filter(Boolean).map(Number))
          : null
      ),
    [calendarStateValue, shownUserIdsKey]
  );

  const handleMouseLeave = useCallback(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        userIDs: chartedUsers.userIDs,
        available: [],
        unavailable: [...chartedUsers.users],
        hovering : false,
      });
    }
  }, [chartedUsers, setChartedUsers]);

  useEffect(() => {
    const calendar = calendarRef.current;
    if (calendar) {
      calendar.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        calendar.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [handleMouseLeave]);

  return (
    <div className="min-h-0 max-h-none" ref={calendarRef}>
      <div className="flex flex-col">
        <div className="sticky h-full mb-2 flex flex-row z-30 lg:top-[0px] top-[44px] -ml-12">
          <div className="bg-white dark:bg-secondary_background-dark w-full flex pl-12">
            <div className="bg-white dark:bg-secondary_background-dark z-50 h-6"></div>
            <DateBar dates={bucket} isGeneralDays={isGeneralDays} />
          </div>
        </div>

        <div>
          <div className="h-px bg-[#7E7E7E]"></div>
          {(() => {
            return timeBlocks.map((group: string[][], groupIndex: number) => {
              return (
                <div key={groupIndex}>
                  {group.map((hour: string[], blockIndexWithinHour: number) => (
                    <div key={`${groupIndex}-${blockIndexWithinHour}`}>
                      <div className="flex flex-col">
                        {hour.map((time: string, bid) => {
                          let blockID =
                            bid + timeBlocks[groupIndex - 1]?.length * 4 || bid;

                          return (
                            <div
                              key={time}
                              className={`border-y-[#7E7E7E] border-x-[#7E7E7E] border-l ${hour.length - 1 === bid ? 'border-b' : ''}`}
                            >
                              <CalRow
                                theShowUserChart={theShowUserChart}
                                onClick={onClick}
                                is30Minute={time.slice(3) === '30'}
                                time={time}
                                bucket={bucket}
                                theCalendarState={theCalendarState}
                                draggable={draggable}
                                columnIndexOffSet={columnIndexOffset}
                                blockID={blockIndexWithinHour * 4 + blockID}
                                user={user}
                                isAdmin={isAdmin}
                                theDragState={theDragState}
                                theMostRecentSelection={theMostRecentSelection}
                                calendarFramework={calendarFramework}
                                chartedUsersData={chartedUsersData}
                                googleCalendarEvents={googleCalendarEvents}
                                borderStyle={
                                  time.slice(3) === '30' ? 'dotted' : 'solid'
                                }
                                groupIndex={groupIndex}
                                maxUsers={maxUsers}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Add space between groups */}
                  {groupIndex < timeBlocks.length - 1 && (
                    <div>
                      <div className="h-8"></div>
                      <div className="h-px bg-[#7E7E7E]"></div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

export default SelectCalendar;

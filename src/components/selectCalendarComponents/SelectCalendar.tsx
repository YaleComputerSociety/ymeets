import React, { 
  Dispatch,
  SetStateAction,
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
import { set } from 'lodash';

interface SelectCalendarProps {
  theCalendarState: [
    calendarState,
    React.Dispatch<React.SetStateAction<calendarState>>,
  ];
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
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
    React.Dispatch<React.SetStateAction<DraggedSelection | undefined>>,
  ];
  theMostRecentSelection: [
    BoundingBox | undefined,
    React.Dispatch<React.SetStateAction<BoundingBox | undefined>>
  ]
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  theGoogleCalendarEvents:
    | [
        calendar_v3.Schema$Event[],
        React.Dispatch<React.SetStateAction<calendar_v3.Schema$Event[]>>,
      ]
    | undefined;

  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    | undefined;
  isGeneralDays: boolean;
  setChartedUsers?: Dispatch<SetStateAction<userData>>;
  chartedUsers?: userData;
}

function SelectCalendar({
  theCalendarState,
  chartedUsersData,
  theCalendarFramework,
  draggable,
  isAdmin,
  bucket,
  columnIndexOffset,
  user,
  startDate,
  endDate,
  theDragState,
  theMostRecentSelection,
  theGoogleCalendarEvents,
  onClick,
  theShowUserChart,
  isGeneralDays,
  setChartedUsers,
  chartedUsers,
}: SelectCalendarProps) {
  const [timeBlocks, setTimeBlocks] = React.useState<string[][][]>(
    generateTimeBlocks(startDate, endDate)
  );

  useEffect(() => {
    setTimeBlocks(generateTimeBlocks(startDate, endDate));
  }, [startDate, endDate]);

  const calendarRef = useRef<HTMLDivElement>(null);

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
                                theCalendarFramework={theCalendarFramework}
                                chartedUsersData={chartedUsersData}
                                theGoogleCalendarEvents={
                                  theGoogleCalendarEvents
                                }
                                borderStyle={
                                  time.slice(3) === '30' ? 'dotted' : 'solid'
                                }
                                groupIndex={groupIndex}
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

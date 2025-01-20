import React from 'react';
import { calendar_v3 } from 'googleapis';
import 'tailwindcss/tailwind.css';
import {
  calandarDate,
  calendarDimensions,
  calanderState,
  userData,
} from '../../types';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import CalRow from './CalRow';
import DateBar from './DateBar';
import { dragProperties } from '../../types';
import { useRef } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';

interface SelectCalanderProps {
  theCalendarState: [
    calanderState,
    React.Dispatch<React.SetStateAction<calanderState>>,
  ];
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  draggable: boolean;
  isAdmin?: boolean;
  bucket: calandarDate[];
  columnIndexOffset: number;
  user: number;
  startDate: Date;
  endDate: Date;
  renderTime: boolean;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];
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
}

function SelectCalander({
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
  theGoogleCalendarEvents,

  onClick,
  theShowUserChart,
}: SelectCalanderProps) {
  const timeBlocks = generateTimeBlocks(startDate, endDate);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [dragState, setDragState] = theDragState;

  const handleMouseLeave = useCallback(
    (event: MouseEvent) => {
      console.log('left');
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.relatedTarget as Node)
      ) {
        setDragState((prev) => ({ ...prev, isSelecting: false }));
      }
    },
    [setDragState]
  );

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
    <div
      className=" max-h-140"
      ref={calendarRef}
      style={{ touchAction: 'none' }}
    >
      <div className="flex flex-col">
        <div className="sticky h-full mb-2 flex flex-row z-30 lg:top-[0px] top-[44px]">
          <div className="bg-white dark:bg-secondary_background-dark w-full flex ">
            <div className="bg-white dark:bg-secondary_background-dark z-50 h-6"></div>
            <DateBar dates={bucket} />
          </div>
        </div>

        <div>
          <div className="h-px bg-black"></div>
          {timeBlocks.map((hour: string[], blockIDOffset: number) => (
            <div key={blockIDOffset}>
              <div className="flex flex-col">
                {hour.map((time: string, blockID) => (
                  <div
                    key={time}
                    className={`border-outline border-l ${hour.length - 1 === blockID ? 'border-b' : ''}`}
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
                      blockID={blockIDOffset * 4 + blockID}
                      user={user}
                      isAdmin={isAdmin}
                      theDragState={[dragState, setDragState]}
                      theCalendarFramework={theCalendarFramework}
                      chartedUsersData={chartedUsersData}
                      theGoogleCalendarEvents={theGoogleCalendarEvents}
                      borderStyle={time.slice(3) === '30' ? 'dotted' : 'solid'}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectCalander;

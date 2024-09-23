import React, { useState, useEffect } from 'react';
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
import { dragProperties } from './CalendarApp';

interface SelectCalanderProps {
  theCalendarState:
    | [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    | undefined;
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
  theCalendarFramework:
    | [
        calendarDimensions,
        React.Dispatch<React.SetStateAction<calendarDimensions>>,
      ]
    | undefined;
  theSelectedDate:
    | [calandarDate, React.Dispatch<React.SetStateAction<calandarDate>>]
    | undefined;
  theGoogleCalendarEvents:
    | [Date, React.Dispatch<React.SetStateAction<Date>>]
    | undefined;
  calendarIndex: number; // New prop to track the calendar index
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
  renderTime,
  theDragState,
  theSelectedDate,
  theGoogleCalendarEvents,
  calendarIndex, // New prop
}: SelectCalanderProps) {
  const timeBlocks = generateTimeBlocks(startDate, endDate);

  const militaryConvert = (time: string) => {
    let hours = Number.parseInt(time.slice(0, 2));
    const AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = Number.parseInt(time.slice(-2));
    return (
      hours +
      (minutes == 0 ? '' : ':' + minutes.toString().padStart(2, '0')) +
      ' ' +
      AmOrPm
    );
  };

  return (
    <div className="relative max-h-130 mr-2" style={{ touchAction: 'none' }}>
      <div className="flex flex-col">
        <div className="sticky h-full overflow-auto top-0 mb-2 flex flex-row z-30 w-[105%]">
          <div className="bg-white w-[110%]">
            <div className="bg-white z-50 h-6"></div>
            <div className="flex">
              <DateBar dates={bucket} />
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="overflow-x-auto">
            <div className="h-px bg-black"></div>
            {timeBlocks.map((hour: string[], blockIDOffset: number) => (
              <div key={blockIDOffset} className="flex flex-row">
                <div className="flex flex-col">
                  {hour.map((time: string, blockID) => (
                    <div key={time} className={`border-black border-l ${hour.length - 1 == blockID ? 'border-b' : ''}`}>
                      <CalRow
                        is30Minute={time.slice(3) === '30'}
                        time={time}
                        bucket={bucket}
                        theCalendarState={theCalendarState}
                        draggable={draggable}
                        columnIndexOffSet={columnIndexOffset}
                        blockID={blockIDOffset * 4 + blockID}
                        user={user}
                        isAdmin={isAdmin}
                        theDragState={theDragState}
                        theCalendarFramework={theCalendarFramework}
                        chartedUsersData={chartedUsersData}
                        theSelectedDate={theSelectedDate}
                        // @ts-expect-error
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
    </div>
  );
}

export default SelectCalander;
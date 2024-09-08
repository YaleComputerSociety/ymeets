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
    <div className="relative max-h-120 mr-2" style={{ touchAction: 'none' }}>
      <div className="flex flex-col">
        <div className="sticky top-0 flex flex-row z-30">
          {calendarIndex === 0 && ( // Only render this div for the first calendar
            <div className="w-11 ml-4 z-40 bg-white"></div>
          )}
          <div className="bg-white">
            <div className="bg-white z-50 h-6 w-full"></div>
            <div className="flex">
              <DateBar dates={bucket} />
            </div>
          </div>
        </div>
        <div className="flex">
          {calendarIndex === 0 && ( // Only render the time column for the first calendar
            <div className="sticky left-0 z-30 bg-white flex flex-row">
              <div className="w-4 h-full bg-white z-50"></div>
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-6 bg-white z-10"></div>
                {timeBlocks.map((hour: string[], blockIDOffset: number) => (
                  <div key={blockIDOffset} className="flex flex-col" style={{ paddingBottom: '0.36rem', marginTop: '-0.3rem' }}>
                    {hour.map((time: string, blockID) => (
                      <div key={blockID} className="h-3 flex items-center justify-end pr-2">
                        {renderTime && time.slice(-2) == '00' && (
                          <span className="text-xs relative z-20">
                            {militaryConvert(time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
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
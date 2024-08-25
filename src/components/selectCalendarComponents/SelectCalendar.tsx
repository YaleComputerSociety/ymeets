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
}: SelectCalanderProps) {
  const timeBlocks = generateTimeBlocks(startDate, endDate);

  const militaryConvert = (time: string) => {
    // expects hh:mm
    let hours = Number.parseInt(time.slice(0, 2)); // gives the value in 24 hours format
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
    <div className="max-h-120 m-2" style={{ touchAction: 'none' }}>
      {timeBlocks.map((hour: string[], blockIDOffset: number) => {
        return (
          <div key={blockIDOffset} className="flex flex-row ">
            <div>
              {blockIDOffset == 0 && (
                <div className="flex flex-row justify-end">
                  <DateBar dates={bucket} />
                </div>
              )}

              <div className="flex flex-col">
                {hour.map((time: string, blockID) => (
                  <>
                    <div className="flex flex-row justify-end">
                      {renderTime && time.slice(-2) == '00' && (
                        <div className="w-12 text-xs relative">
                          <p
                            className="absolute"
                            style={{ top: '-0.5rem', right: '0.6rem' }}
                          >
                            {militaryConvert(time)}
                          </p>
                        </div>
                      )}
                      {renderTime && time.slice(-2) != '00' && (
                        <div className="w-12"></div>
                      )}
                      <div
                        className={`border-black border-l ${hour.length - 1 == blockID ? 'border-b' : ''}`}
                      >
                        <CalRow
                          is30Minute={time.slice(3) === '30'}
                          key={time}
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
                        />
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SelectCalander;

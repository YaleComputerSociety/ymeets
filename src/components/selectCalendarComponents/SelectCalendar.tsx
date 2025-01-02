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
import { dragProperties } from './CalendarApp';

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
}: SelectCalanderProps) {
  const timeBlocks = generateTimeBlocks(startDate, endDate);

  return (
    <div
      className="relative max-h-130 mr-2 w-screen"
      style={{ touchAction: 'none' }}
    >
      <div className="flex flex-col">
        <div className="sticky h-full top-0 mb-2 flex flex-row z-30">
          <div className="bg-white w-full">
            <div className="bg-white z-50 h-6"></div>
            <DateBar dates={bucket} />
          </div>
        </div>
        <div className="w-screen">
          <div className="h-px bg-black"></div>
          {timeBlocks.map((hour: string[], blockIDOffset: number) => (
            <div key={blockIDOffset}>
              <div className="flex flex-col">
                {hour.map((time: string, blockID) => (
                  <div
                    key={time}
                    className={`border-black border-l ${hour.length - 1 === blockID ? 'border-b' : ''}`}
                  >
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

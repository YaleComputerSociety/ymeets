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

import { FaArrowLeft } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';

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
  handleNext: any;
  handlePrev: any;
  currentStartPage: number;
  numberOfColumns: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
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
  handleNext,
  handlePrev,
  currentStartPage,
  numberOfColumns,
  onClick,
}: SelectCalanderProps) {
  const timeBlocks = generateTimeBlocks(startDate, endDate);
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

  return (
    <div className="relative max-h-130 mr-2" style={{ touchAction: 'none' }}>
      <div className="sticky z-50 flex flex-row justify-between mt-5 top-0">
        {currentStartPage !== 0 ? (
          <FaArrowLeft
            onClick={handlePrev}
            size={35}
            className="bg-primary text-white p-2 rounded-lg cursor-pointer "
          />
        ) : (
          <div></div>
        )}
        {currentStartPage + numberOfColumns <
          calendarFramework.dates.flat().length && (
          <FaArrowRight
            onClick={handleNext}
            size={35}
            className="bg-primary text-white p-2 rounded-lg cursor-pointer "
          />
        )}
      </div>

      <div className="flex flex-col">
        <div className="sticky h-full mb-2 flex flex-row z-30 top-0">
          <div className="bg-white w-full flex">
            <div className="bg-white z-50 h-6"></div>
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
                    className={`border-steelgray border-l ${hour.length - 1 === blockID ? 'border-b' : ''}`}
                  >
                    <CalRow
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

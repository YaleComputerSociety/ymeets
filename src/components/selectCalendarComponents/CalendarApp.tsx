import React from 'react';
import { calendar_v3 } from 'googleapis';
import SelectCalander from './SelectCalendar';
import {
  calendarDimensions,
  calanderState,
  userData,
  calandarDate,
} from '../../types';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';

interface CalendarProps {
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  theCalendarState: [
    calanderState,
    React.Dispatch<React.SetStateAction<calanderState>>,
  ];
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  draggable: boolean;
  user: number;
  isAdmin: boolean;
  title: string;

  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];
  theGoogleCalendarEvents: [
    calendar_v3.Schema$Event[],
    React.Dispatch<React.SetStateAction<calendar_v3.Schema$Event[]>>,
  ];
}

export interface dragProperties {
  dragStartedOnID: number[];
  dragEndedOnID: number[];
  dragStartedOn: boolean;
  blocksAffectedDuringDrag: Set<any>;
}

export default function Calendar({
  theCalendarFramework,
  theCalendarState,
  chartedUsersData,
  draggable,
  user,
  isAdmin,
  title,
  theDragState,
  theGoogleCalendarEvents,
}: CalendarProps) {
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const [calendarState, setCalendarState] = theCalendarState;

  let columnIndexOffset = 0;

  const [dragState, setDragState] = theDragState;

  const hasTitle = title !== '';

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

  const timeBlocks = generateTimeBlocks(
    calendarFramework.startTime,
    calendarFramework.endTime
  );

  return (
    <div className="flex flex-col">
      {hasTitle && (
        <div className="flex flex-row">
          <p className="text-3xl sm:text-4xl mt-0 mb-4 sm:mb-1 sm:ml-6 font-bold">
            {title}
          </p>
        </div>
      )}

      <div
        id="cal"
        className="flex justify-center mb-4 md:m-5 md:justify-start relative"
      >
        <div
          style={{ width: '3.75rem', height: '3.75rem' }}
          className="absolute mt-0 ml-0 top-0 left-0 bg-white rounded-tl-lg z-50"
        ></div>
        <div className="bg-white flex flex-row w-fit max-w-full h-full overflow-auto sm:pb-4 md:bg-white rounded-lg max-h-130">
          {/* Time Column */}
          <div className="sticky left-0 z-20 bg-white"></div>
          <div className="sticky left-0 z-30 bg-white">
            <div style={{ width: '3.75rem', height: '3.75rem' }}></div>
            <div className="bg-white">
              <div
                style={{ width: '3.75rem', height: '0.50rem' }}
                className="bg-white"
              ></div>
              {timeBlocks.map((hour: string[], blockIDOffset: number) => (
                <div
                  key={blockIDOffset}
                  className="flex flex-col"
                  style={{ paddingBottom: '0.36rem', marginTop: '-0.3rem' }}
                >
                  {hour.map((time: string, blockID) => (
                    <div
                      key={blockID}
                      className="h-3 flex items-center justify-end pr-2 bg-white"
                    >
                      {time.slice(-2) == '00' && (
                        <span className="text-xs relative z-20">
                          {militaryConvert(time)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div
                style={{ width: '3.75rem', height: '0.50rem' }}
                className="bg-white"
              ></div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="flex">
            {calendarFramework?.dates.map(
              (bucket: calandarDate[], index: number) => {
                if (index !== 0) {
                  const prev_bucket = calendarFramework.dates[index - 1];
                  columnIndexOffset += prev_bucket.length;
                }

                return (
                  <div className="ml-0 mr-2 mb-4" key={index}>
                    <SelectCalander
                      renderTime={false}
                      theCalendarState={[calendarState, setCalendarState]}
                      bucket={bucket}
                      draggable={draggable}
                      isAdmin={isAdmin}
                      key={index}
                      user={user}
                      columnIndexOffset={columnIndexOffset}
                      startDate={calendarFramework.startTime}
                      endDate={calendarFramework.endTime}
                      theDragState={[dragState, setDragState]}
                      theCalendarFramework={theCalendarFramework}
                      chartedUsersData={chartedUsersData}
                      theGoogleCalendarEvents={theGoogleCalendarEvents}
                      calendarIndex={index}
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

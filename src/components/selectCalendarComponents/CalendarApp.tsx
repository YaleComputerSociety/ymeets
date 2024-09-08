import React from 'react';
import SelectCalander from './SelectCalendar';
import {
  calendarDimensions,
  calanderState,
  userData,
  calandarDate,
} from '../../types';

interface CalendarProps {
  theCalendarFramework:
    | [
        calendarDimensions,
        React.Dispatch<React.SetStateAction<calendarDimensions>>,
      ]
    | undefined;
  theCalendarState:
    | [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    | undefined;
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  draggable: boolean;
  user: number;
  isAdmin: boolean;
  title: string;
  theSelectedDate:
    | [calandarDate, React.Dispatch<React.SetStateAction<calandarDate>>]
    | undefined;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];
  theGoogleCalendarEvents: [Date, React.Dispatch<React.SetStateAction<Date>>];
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
  theSelectedDate,
  theDragState,
  theGoogleCalendarEvents,
}: CalendarProps) {
  // @ts-expect-error
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

  // @ts-expect-error
  const [calendarState, setCalendarState] = theCalendarState;

  let columnIndexOffset = 0;

  const [dragState, setDragState] = theDragState;

  const hasTitle = title !== '';

  return (
    <div className="flex flex-col max-w-full">
      {hasTitle && (
        <p className="text-3xl sm:text-4xl mt-0 mb-4 sm:mb-1 sm:ml-6 font-bold">
          {title}
        </p>
      )}

      <div
        id="cal"
        className="flex justify-center mb-4 md:m-5 md:justify-start"
      >
        <div
          className="bg-white flex flex-row w-fit max-w-full h-full overflow-scroll sm:pb-4 
                                md:bg-white rounded-lg"
        >
          {calendarFramework?.dates.map(
            (bucket: calandarDate[], index: number) => {
              if (index !== 0) {
                const prev_bucket = calendarFramework.dates[index - 1];
                columnIndexOffset += prev_bucket.length;
              }

              return (
                <div className="ml-0 mr-2 mb-4" key={index}>
                  <SelectCalander
                    renderTime={index == 0}
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
                    theSelectedDate={theSelectedDate}
                    theGoogleCalendarEvents={theGoogleCalendarEvents}
                    calendarIndex={index} // Pass the index as calendarIndex
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
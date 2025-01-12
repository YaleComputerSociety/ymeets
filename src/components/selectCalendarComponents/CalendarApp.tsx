import React from 'react';
import { calendar_v3 } from 'googleapis';
import SelectCalander from './SelectCalendar';
import { calendarDimensions, calanderState, userData } from '../../types';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { useState } from 'react';
import { getTimezone } from '../../firebase/events';

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
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];
  theGoogleCalendarEvents: [
    calendar_v3.Schema$Event[],
    React.Dispatch<React.SetStateAction<calendar_v3.Schema$Event[]>>,
  ];
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    | undefined;
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
  theDragState,
  theGoogleCalendarEvents,
  theShowUserChart,
  onClick,
}: CalendarProps) {
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const [calendarState, setCalendarState] = theCalendarState;

  const [dragState, setDragState] = theDragState;

  const militaryConvert = (time: string) => {
    let hours = Number.parseInt(time.slice(0, 2));
    const AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = Number.parseInt(time.slice(-2));
    return (
      hours +
      (minutes === 0 ? '' : ':' + minutes.toString().padStart(2, '0')) +
      ' ' +
      AmOrPm
    );
  };

  const timeBlocks = generateTimeBlocks(
    calendarFramework.startTime,
    calendarFramework.endTime
  );

  const calculateColumnsPerPage = () => {
    const width = window.innerWidth;
    if (width > 1200) return 7;
    if (width > 900) return 5;
    return 3;
  };

  const [numberOfColumnsPerPage, setNumberOfColumnsPerPage] = React.useState(
    calculateColumnsPerPage
  );

  React.useEffect(() => {
    const handleResize = () => {
      setNumberOfColumnsPerPage(calculateColumnsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [currentStartPage, setCurrentStartPage] = React.useState(0);

  const handlePrev = () => {
    setCurrentStartPage(Math.max(currentStartPage - 1, 0));
  };

  const handleNext = () => {
    if (
      currentStartPage + numberOfColumnsPerPage <
      calendarFramework.dates.flat().length
    ) {
      setCurrentStartPage(currentStartPage + 1);
    }
  };

  // const isSmallScreen = window.innerWidth < 1024;
  // console.log(isSmallScreen);

  const [calStartTime, setCalStartTime] = useState(calendarFramework.startTime);
  const [calEndTime, setCalEndTime] = useState(calendarFramework.endTime);

  const handleTimezoneUpdate = (newStartTime: Date, newEndTime: Date) => {
    setCalStartTime(newStartTime);
    setCalEndTime(newEndTime);

    // Update your calendar framework or state as needed
    setCalendarFramework((prev) => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  return (
    <div className="flex flex-col space-y-0">
      <div className="flex justify-center ml-2 mr-2 md:justify-start md:m-5 ml-0 mb-1">
        <div className="w-full max-w-full">
          <TimezoneChanger
            theCalendarFramework={[calendarFramework, setCalendarFramework]}
            initialTimezone={getTimezone()}
          />
        </div>
      </div>
      <div
        id="cal"
        className="flex justify-center mb-4 md:m-5 ml-0 md:justify-start relative"
      >
        <div
          style={{ width: '3.00rem', height: '3.75rem' }}
          className="absolute mt-0 ml-0 top-0 left-0 bg-white dark:bg-secondary_background-dark rounded-tl-lg z-40"
        ></div>

        <div className="bg-white dark:bg-secondary_background-dark flex flex-row w-full max-w-full h-full lg:overflow-auto sm:pb-4 md:bg-white rounded-lg lg:max-h-140">
          <div className="sticky left-0 z-20 bg-white dark:bg-secondary_background-dark"></div>
          <div className="sticky left-0 z-30 bg-white dark:bg-secondary_background-dark">
            {/* handles aligning it with the cal */}

            <>
              <div style={{ height: '6.3rem' }}></div>
              <div style={{ height: '0.50rem' }}></div>
            </>

            {/* <>
                <div style={{ height: '3.5rem' }}></div>
                <div style={{ height: '0.50rem' }}></div>
              </> */}

            {timeBlocks.map((hour: string[], blockIDOffset: number) => (
              <div
                key={blockIDOffset}
                className="flex flex-col"
                style={{ paddingBottom: '1.36rem', marginTop: '-0.3rem' }}
              >
                {hour.map((time: string, blockID) => (
                  <div
                    key={blockID}
                    className="h-3 flex items-center justify-end pr-1 bg-white dark:bg-secondary_background-dark"
                  >
                    {time.slice(-2) === '00' && (
                      <span className="text-xs p-0 text-outline dark:text-text-dark relative z-20">
                        {militaryConvert(time)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div
              style={{ width: '3.00rem', height: '0.50rem' }}
              className="bg-white dark:bg-secondary_background-dark"
            ></div>
          </div>

          <div className="w-full flex-1">
            <SelectCalander
              theShowUserChart={theShowUserChart}
              onClick={onClick}
              handleNext={handleNext}
              handlePrev={handlePrev}
              numberOfColumns={numberOfColumnsPerPage}
              currentStartPage={currentStartPage}
              renderTime={false}
              theCalendarState={[calendarState, setCalendarState]}
              bucket={calendarFramework?.dates
                .flat()
                .slice(
                  currentStartPage,
                  currentStartPage + numberOfColumnsPerPage
                )}
              draggable={draggable}
              isAdmin={isAdmin}
              user={user}
              columnIndexOffset={currentStartPage}
              startDate={calendarFramework.startTime}
              endDate={calendarFramework.endTime}
              theDragState={[dragState, setDragState]}
              theCalendarFramework={theCalendarFramework}
              chartedUsersData={chartedUsersData}
              theGoogleCalendarEvents={theGoogleCalendarEvents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

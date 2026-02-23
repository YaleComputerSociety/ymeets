import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useLayoutEffect} from 'react';
import { calendar_v3 } from 'googleapis';
import SelectCalander from './SelectCalendar';
import { calendarDimensions, calanderState, userData } from '../../types';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
// import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { dragProperties } from '../../types';

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
  isGeneralDays: boolean;
  setChartedUsers?: Dispatch<SetStateAction<userData>>;
  chartedUsers?: userData;
  setCalendarHeight?: Dispatch<SetStateAction<number | null>>;
  compactMode?: boolean;
  calendarLabel?: string;
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
  isGeneralDays,
  setChartedUsers,
  chartedUsers,
  setCalendarHeight,
  compactMode = false,
  calendarLabel,
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
    if (compactMode) {
      // Side-by-side mode: each calendar gets half the width
      if (width > 1400) return 5;
      if (width > 1200) return 4;
      return 3;
    }
    // Expanded mode: calendar has full width, show up to 7 days max
    if (width > 1000) return 7;
    if (width > 800) return 6;
    if (width > 600) return 5;
    return 4;
  };

  const [numberOfColumnsPerPage, setNumberOfColumnsPerPage] = React.useState(
    calculateColumnsPerPage
  );

  const handleStopHover = useCallback(() => {
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

  React.useEffect(() => {
    // Recalculate columns when compactMode changes (expand/collapse)
    setNumberOfColumnsPerPage(calculateColumnsPerPage());

    const handleResize = () => {
      setNumberOfColumnsPerPage(calculateColumnsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [compactMode]);

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

  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!setCalendarHeight || !ref.current) return;
    setCalendarHeight(ref.current.getBoundingClientRect().height);
  }, [setCalendarHeight]);


  return (
    <div className="flex flex-col space-y-0 mb-2"
    onMouseLeave={() => {
        handleStopHover();
        console.log("Mouse Left Calendar");
      }}
    ref={ref}
    >
      <div className="sticky top-0 flex justify-between items-center lg:mr-5 lg:ml-5 ml-0 mr-0 bg-white dark:bg-secondary_background-dark rounded-t-lg z-40 p-0">
        {currentStartPage !== 0 ? (
          <IconArrowLeft
            onClick={handlePrev}
            size={45}
            className="text-outline dark:text-text-dark p-3 ml-8  lg:ml-0 rounded-lg cursor-pointer"
          />
        ) : (
          <div className="p-3 h-11 w-11"></div>
        )}

        {calendarLabel && (
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {calendarLabel}
          </span>
        )}

        {currentStartPage + numberOfColumnsPerPage <
        calendarFramework.dates.flat().length ? (
          <IconArrowRight
            onClick={handleNext}
            size={45}
            className="text-outline dark:text-text-dark p-3 mr-5 lg:mr-0 rounded-lg cursor-pointer "
          />
        ) : (
          <div className="p-3 h-11 w-11"></div>
        )}
      </div>
      <div
        id="cal"
        className="flex justify-center mb-4 md:m-5 ml-0 md:justify-start relative "
      >
        <div
          style={{ width: '3.00rem', height: '2.50rem' }}
          className="absolute mt-0 ml-0 top-0 left-0 bg-white dark:bg-secondary_background-dark rounded-tl-none rounded-tr-none z-30"
        ></div>

        <div className="bg-white dark:bg-secondary_background-dark flex flex-row w-full max-w-full h-full lg:overflow-auto sm:pb-4 md:bg-white rounded-lg rounded-tr-none lg:max-h-140 pr-9 pl-7 lg:p-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
          <div className="sticky left-0 z-20 bg-white dark:bg-secondary_background-dark"></div>
          <div className="sticky left-0 z-20 bg-white dark:bg-secondary_background-dark">
            {/* handles aligning it with the cal */}

            <>
              <div style={{ height: '2.30rem' }}></div>
              <div style={{ height: '0.50rem' }}></div>
            </>

            {timeBlocks.map((group: string[][], groupIndex: number) => (
              <div key={groupIndex}>
                {/* Render the time blocks for this group */}
                {group.map((hour: string[], blockIDOffset: number) => (
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

                {/* Add space between groups */}
                {groupIndex < timeBlocks.length - 1 && (
                  <div className="h-8"></div>
                )}
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
              isGeneralDays={isGeneralDays}
              setChartedUsers={setChartedUsers}
              chartedUsers={chartedUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

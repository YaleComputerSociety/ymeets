import {
  useState,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { calendar_v3 } from 'googleapis';
import {
  calanderState,
  userData,
  calendarDimensions,
  dragProperties,
} from '../../types';
import {
  getParticipantIndex,
  getAccountId,
  getAccountName,
  updateAnonymousUserToAuthUser,
} from '../../backend/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import SharedSidebar from './SharedSidebar';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import ButtonSmall from '../utils/components/ButtonSmall';
import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import { useGoogleCalendar } from '../../backend/useGoogleCalService';
import { useAuth } from '../../backend/authContext';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

interface SideBySideViewProps {
  // Calendar states
  timeSelectCalendarState: calanderState;
  setTimeSelectCalendarState: Dispatch<SetStateAction<calanderState>>;
  groupViewCalendarState: calanderState;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;

  // User data
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  allPeople: string[];
  allUsers: userData;
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;

  // Event data
  eventName: string;
  eventDescription: string;
  locationOptions: string[];
  locationVotes: any;
  adminChosenLocation: string | undefined;
  setAdminChosenLocation: Dispatch<SetStateAction<string | undefined>>;

  // Other
  code: string | undefined;
  isAdmin: boolean;
  isGeneralDays: boolean;

  // Google Calendar events for TimeSelect side
  googleCalendarEvents: calendar_v3.Schema$Event[];
  setGoogleCalendarEvents: Dispatch<
    SetStateAction<calendar_v3.Schema$Event[]>
  >;

  // Google Calendar list state
  googleCalendars: Calendar[];
  setGoogleCalendars: Dispatch<SetStateAction<Calendar[]>>;
  selectedCalendarIds: string[];
  setSelectedCalendarIds: Dispatch<SetStateAction<string[]>>;

  // Location selection (user's preferred locations)
  selectedLocations: string[];
  setSelectedLocations: Dispatch<SetStateAction<string[]>>;

  // Save functionality
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function SideBySideView({
  timeSelectCalendarState,
  setTimeSelectCalendarState,
  groupViewCalendarState,
  calendarFramework,
  setCalendarFramework,
  chartedUsers,
  setChartedUsers,
  allPeople,
  allUsers,
  peopleStatus,
  setPeopleStatus,
  eventName,
  eventDescription,
  locationOptions,
  locationVotes,
  adminChosenLocation,
  setAdminChosenLocation,
  code,
  isAdmin,
  isGeneralDays,
  googleCalendarEvents,
  setGoogleCalendarEvents,
  googleCalendars,
  setGoogleCalendars,
  selectedCalendarIds,
  setSelectedCalendarIds,
  selectedLocations,
  setSelectedLocations,
  onSave,
  isSaving,
}: SideBySideViewProps) {
  const [showUserChart, setShowUserChart] = useState(false);
  const [participantToggleClicked, setParticipantToggleClicked] = useState(true);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);

  // Track which calendar is expanded (null = side-by-side, 'left' = edit expanded, 'right' = group expanded)
  const [expandedCalendar, setExpandedCalendar] = useState<'left' | 'right' | null>(null);

  // Google Calendar hook for fetching events
  const { hasAccess, requestAccess, getEvents, getCalendars } = useGoogleCalendar();
  const { login, currentUser } = useAuth();

  // Helper functions for autofill
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const dateToMinutes = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const doesBlockOverlapEvent = (
    blockTime: string,
    blockDate: Date,
    event: calendar_v3.Schema$Event
  ): boolean => {
    if (!event.start?.dateTime || !event.end?.dateTime) return false;

    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);

    if (!isSameDate(eventStart, blockDate)) return false;

    const blockStartMinutes = timeToMinutes(blockTime);
    const blockEndMinutes = blockStartMinutes + 15;
    const eventStartMinutes = dateToMinutes(eventStart);
    const eventEndMinutes = dateToMinutes(eventEnd);

    return (
      blockStartMinutes <= eventEndMinutes &&
      blockEndMinutes > eventStartMinutes
    );
  };

  const autofillAvailabilityFromCalendar = (
    events: calendar_v3.Schema$Event[],
    dates: any[],
    timeBlocks: string[],
    currentAvailability: boolean[][]
  ): boolean[][] => {
    const newAvailability = currentAvailability.map((col) => [...col]);

    for (let colIndex = 0; colIndex < dates.length; colIndex++) {
      const date = dates[colIndex].date;

      for (let blockIndex = 0; blockIndex < timeBlocks.length; blockIndex++) {
        const timeBlock = timeBlocks[blockIndex];

        const hasEvent = events.some((event) =>
          doesBlockOverlapEvent(timeBlock, date, event)
        );

        newAvailability[colIndex][blockIndex] = !hasEvent;
      }
    }

    return newAvailability;
  };

  // Fetch Google Calendar events when selected calendars change
  const fetchGoogleCalEvents = useCallback(async (calIds: string[]) => {
    if (!hasAccess || calIds.length === 0) {
      setGoogleCalendarEvents([]);
      return [];
    }

    const dates = calendarFramework.dates.flat();
    if (dates.length === 0) return [];

    const dateTimestamps = dates.map((d) => (d.date as Date).getTime());
    const startDate = new Date(Math.min(...dateTimestamps));
    startDate.setHours(0, 0, 0, 0);
    const timeMin = startDate.toISOString();

    const endDate = new Date(Math.max(...dateTimestamps));
    endDate.setHours(23, 59, 59, 999);
    const timeMax = endDate.toISOString();

    const allEvents: calendar_v3.Schema$Event[] = [];

    for (const calId of calIds) {
      try {
        const events = await getEvents(
          calId,
          timeMin,
          timeMax,
          calendarFramework.timezone
        );

        // Filter out multi-day events
        const singleDayEvents = events.filter((event) => {
          if (!event.start?.dateTime || !event.end?.dateTime) return false;
          const start = new Date(event.start.dateTime);
          const end = new Date(event.end.dateTime);
          return start.getDay() === end.getDay();
        });

        allEvents.push(...singleDayEvents);
      } catch (error) {
        console.error('Error fetching events for calendar:', calId, error);
      }
    }

    setGoogleCalendarEvents(allEvents);
    return allEvents;
  }, [hasAccess, calendarFramework.dates, calendarFramework.timezone, getEvents, setGoogleCalendarEvents]);

  // Fetch calendars and events when access is available
  useEffect(() => {
    const initializeCalendars = async () => {
      if (hasAccess && googleCalendars.length === 0) {
        try {
          const calendars = await getCalendars();
          setGoogleCalendars(calendars);
        } catch (error) {
          console.error('Error fetching calendars:', error);
        }
      }
    };
    initializeCalendars();
  }, [hasAccess, googleCalendars.length, getCalendars, setGoogleCalendars]);

  // Fetch events when selected calendar IDs change
  useEffect(() => {
    if (hasAccess && selectedCalendarIds.length > 0) {
      fetchGoogleCalEvents(selectedCalendarIds);
    } else if (selectedCalendarIds.length === 0) {
      setGoogleCalendarEvents([]);
    }
  }, [hasAccess, selectedCalendarIds, fetchGoogleCalEvents, setGoogleCalendarEvents]);

  // Get current user index
  const getCurrentUserIndex = useCallback(() => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      user =
        timeSelectCalendarState !== undefined
          ? Object.keys(timeSelectCalendarState).length - 1
          : 0;
    }
    return user;
  }, [timeSelectCalendarState]);

  // Autofill availability from Google Calendar
  const handleAutofillAvailabilityClick = async () => {
    if (!currentUser) {
      const user = await login();
      if (!user) return;
      updateAnonymousUserToAuthUser(getAccountName());
    }

    if (!hasAccess) {
      const scopeGranted = await requestAccess();
      if (!scopeGranted) return;
    }

    const calIds = selectedCalendarIds.length > 0 ? selectedCalendarIds : [];

    if (calIds.length === 0) {
      // If no calendars selected, try to fetch them first
      const calendars = await getCalendars();
      setGoogleCalendars(calendars);
      return;
    }

    const events = await fetchGoogleCalEvents(calIds);

    const newAvailability = autofillAvailabilityFromCalendar(
      events,
      calendarFramework.dates.flat(),
      generateTimeBlocks(
        calendarFramework.startTime,
        calendarFramework.endTime
      )
        .flat()
        .flat(),
      timeSelectCalendarState[getCurrentUserIndex()]
    );

    const newCalendarState = { ...timeSelectCalendarState };
    newCalendarState[getCurrentUserIndex()] = newAvailability;
    setTimeSelectCalendarState(newCalendarState);
  };

  // Drag state for left calendar (TimeSelect - user editing)
  const [leftDragState, setLeftDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false,
    lastPosition: null,
  });

  // Drag state for right calendar (GroupView - read-only, no drag)
  const [rightDragState, setRightDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false,
    lastPosition: null,
  });

  // Real-time sync: Derive GroupView state from TimeSelect state
  // This ensures the right calendar updates instantly when the user makes selections on the left
  const derivedGroupViewState = useMemo(() => {
    const userIndex = getCurrentUserIndex();
    const newState = [...groupViewCalendarState];

    if (timeSelectCalendarState[userIndex]) {
      newState[userIndex] = timeSelectCalendarState[userIndex];
    }
    return newState;
  }, [timeSelectCalendarState, groupViewCalendarState, getCurrentUserIndex]);

  // Filter charted users based on people status
  const filteredChartedUsers = useMemo(
    () => ({
      ...chartedUsers,
      users: allUsers?.users?.filter(
        (user) => peopleStatus[user.name] === true
      ),
    }),
    [chartedUsers, allUsers, peopleStatus]
  );

  // No-op setter for read-only calendar
  const noop = useCallback(() => {}, []);

  return (
    <div className="w-full px-0 lg:px-8 mb-5 lg:mb-0">
      {/* Main layout: 4-column grid matching GroupView/TimeSelect */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-0 flex flex-col">
        {/* Sidebar - col-span-1 (same as GroupView/TimeSelect) */}
        <div
          className="text-text dark:text-text-dark lg:p-0 p-4 lg:ml-5 lg:mt-5 col-span-1 flex flex-col lg:items-start lg:justify-start items-center justify-center mb-3 overflow-hidden"
          style={
            calendarHeight
              ? { height: calendarHeight + 60, maxHeight: calendarHeight + 60 }
              : undefined
          }
        >
          <SharedSidebar
            eventName={eventName}
            eventDescription={eventDescription}
            code={code}
            isAdmin={isAdmin}
            allPeople={allPeople}
            peopleStatus={peopleStatus}
            setPeopleStatus={setPeopleStatus}
            locationOptions={locationOptions}
            locationVotes={locationVotes}
            adminChosenLocation={adminChosenLocation}
            setAdminChosenLocation={setAdminChosenLocation}
            chartedUsers={chartedUsers}
            setChartedUsers={setChartedUsers}
            calendarHeight={calendarHeight}
            participantToggleClicked={participantToggleClicked}
            setParticipantToggleClicked={setParticipantToggleClicked}
            googleCalendars={googleCalendars}
            setGoogleCalendars={setGoogleCalendars}
            selectedCalendarIds={selectedCalendarIds}
            setSelectedCalendarIds={setSelectedCalendarIds}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
          />
        </div>

        {/* Calendar Area - col-span-3 (same as GroupView/TimeSelect) */}
        <div className="col-span-3">
          <div className="w-full">
            <div className="flex flex-col space-y-0 mb-2">
              {/* Top bar with timezone, save, and view toggle */}
              <div className="flex justify-center ml-2 mr-2 md:justify-start md:ml-5 md:mr-5 md:mt-5 mb-2">
                <div className="hidden md:flex w-full max-w-full items-center gap-2">
                  <ButtonSmall
                    bgColor="primary"
                    textColor="white"
                    themeGradient={false}
                    onClick={handleAutofillAvailabilityClick}
                    className="!rounded-lg"
                  >
                    Autofill Availability
                  </ButtonSmall>
                  <div className="flex-1">
                    <TimezoneChanger
                      theCalendarFramework={[calendarFramework, setCalendarFramework]}
                      initialTimezone={(() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const urlTimezone = urlParams.get('tz');
                        return urlTimezone || getUserTimezone();
                      })()}
                    />
                  </div>
                  <ButtonSmall
                    bgColor="primary"
                    textColor="white"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </ButtonSmall>
                </div>
              </div>

              {/* Side-by-side calendars */}
              <div className="flex gap-4 px-5">
                {/* Left Calendar (Edit Your Availability) */}
                {expandedCalendar !== 'right' && (
                  <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Expand/Collapse button - superimposed on top right */}
                    <button
                      onClick={() => setExpandedCalendar(expandedCalendar === 'left' ? null : 'left')}
                      className="absolute -top-2 -right-2 z-50 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
                      title={expandedCalendar === 'left' ? 'Collapse' : 'Expand'}
                    >
                      {expandedCalendar === 'left' ? (
                        <IconArrowsMinimize size={16} className="text-gray-600 dark:text-gray-300" />
                      ) : (
                        <IconArrowsMaximize size={16} className="text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                    <div className="bg-white dark:bg-secondary_background-dark rounded-lg flex-1">
                      <Calendar
                        compactMode={expandedCalendar !== 'left'}
                        theCalendarState={[
                          timeSelectCalendarState,
                          setTimeSelectCalendarState,
                        ]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework]}
                        chartedUsersData={undefined}
                        draggable={true}
                        user={getCurrentUserIndex()}
                        isAdmin={false}
                        theDragState={[leftDragState, setLeftDragState]}
                        theGoogleCalendarEvents={[
                          googleCalendarEvents,
                          setGoogleCalendarEvents,
                        ]}
                        onClick={() => {}}
                        theShowUserChart={undefined}
                        isGeneralDays={isGeneralDays}
                        setCalendarHeight={setCalendarHeight}
                        calendarLabel="Your Availability"
                      />
                    </div>
                  </div>
                )}

                {/* Right Calendar (Group Availability) */}
                {expandedCalendar !== 'left' && (
                  <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Expand/Collapse button - superimposed on top right */}
                    <button
                      onClick={() => setExpandedCalendar(expandedCalendar === 'right' ? null : 'right')}
                      className="absolute -top-2 -right-2 z-50 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
                      title={expandedCalendar === 'right' ? 'Collapse' : 'Expand'}
                    >
                      {expandedCalendar === 'right' ? (
                        <IconArrowsMinimize size={16} className="text-gray-600 dark:text-gray-300" />
                      ) : (
                        <IconArrowsMaximize size={16} className="text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                    <div className="bg-white dark:bg-secondary_background-dark rounded-lg flex-1">
                      <Calendar
                        compactMode={expandedCalendar !== 'right'}
                        theCalendarState={[derivedGroupViewState, noop]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework]}
                        chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                        draggable={false}
                        user={getCurrentUserIndex()}
                        isAdmin={true}
                        theDragState={[rightDragState, setRightDragState]}
                        theGoogleCalendarEvents={[[], noop]}
                        onClick={() => {
                          if (showUserChart === true) {
                            return;
                          }
                          setShowUserChart(true);
                          setTimeout(() => setShowUserChart(false), 3000);
                        }}
                        theShowUserChart={[showUserChart, setShowUserChart]}
                        isGeneralDays={false}
                        setChartedUsers={setChartedUsers}
                        chartedUsers={chartedUsers}
                        calendarLabel="Group Availability"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

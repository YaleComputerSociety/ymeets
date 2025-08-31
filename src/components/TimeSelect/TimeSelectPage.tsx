import LocationSelectionComponent from './LocationSelectionComponent';
import { calendar_v3, google } from 'googleapis';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { DateTime } from 'luxon';
import {
  calanderState,
  userData,
  calendarDimensions,
  Availability,
  calandarDate,
  dragProperties,
} from '../../types';
import eventAPI from '../../backend/eventAPI';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAccountId,
  getAccountName,
  getAvailabilityByAccountId,
  getAvailabilityByName,
  getEventOnPageload,
  wrappedSaveParticipantDetails,
  getEventName,
  getEventDescription,
  getLocationOptions,
  getParticipantIndex,
  getChosenDayAndTime,
  updateAnonymousUserToAuthUser,
  getSelectedCalendarIDsByUserID,
  setUserSelectedCalendarIDs,
} from '../../backend/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { AddGoogleCalendarPopup } from '../utils/components/AddGoogleCalendarPopup';
import { LoginPopup } from '../utils/components/LoginPopup/login_guest_popup';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import LOGO from '../DaySelect/general_popup_component/googlelogo.png';
import { getDates } from '../../backend/events';
import {
  adjustBlockIDColumnID,
  getUserTimezone,
} from '../utils/functions/timzoneConversions';
import ButtonSmall from '../utils/components/ButtonSmall';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../backend/authContext';
import { useGoogleCalendar } from '../../backend/useGoogleCalService';
import { get } from 'lodash';

/**
 *
 * @returns Page Component
 */
function TimeSelectPage({
  isEditing,
  toggleEditing,
  onFetchComplete,
  code,
  chartedUsers,
  setChartedUsers,
  calendarState,
  setCalendarState,
  calendarFramework,
  setCalendarFramework,
  loading,
  setLoading,
  eventName,
  setEventName,
  eventDescription,
  setEventDescription,
  locationOptions,
  setLocationOptions,
  areSelectingGeneralDays,
  setAreSelectingGeneralDays,
  isGeneralDays,
  setIsGeneralDays,
  hasAvailability,
  setHasAvailability,
}: {
  isEditing: boolean;
  toggleEditing: () => void;
  onFetchComplete: () => void;
  code: string | undefined;
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  calendarState: calanderState;
  setCalendarState: Dispatch<SetStateAction<calanderState>>;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  eventName: string;
  setEventName: Dispatch<SetStateAction<string>>;
  eventDescription: string;
  setEventDescription: Dispatch<SetStateAction<string>>;
  locationOptions: string[];
  setLocationOptions: Dispatch<SetStateAction<string[]>>;
  areSelectingGeneralDays: boolean;
  setAreSelectingGeneralDays: Dispatch<SetStateAction<boolean>>;
  isGeneralDays: boolean;
  setIsGeneralDays: Dispatch<SetStateAction<boolean>>;
  hasAvailability: boolean;
  setHasAvailability: Dispatch<SetStateAction<boolean>>;
}) {
  const [isGcalPopupOpen, setGcalPopupOpen] = useState(false);

  const closeGcalPopup = () => {
    setGcalPopupOpen(false);
  };

  const {
    hasAccess,
    initialized,
    requestAccess,
    getCalendars,
    getEvents,
    disconnect,
  } = useGoogleCalendar();
  const { login, currentUser } = useAuth();

  const nav = useNavigate();

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const [promptUserForLogin, setPromptUserForLogin] = useState(false);

  useEffect(() => {
    onFetchComplete();
  }, [onFetchComplete]);

  const endPromptUserForLogin = () => {
    setPromptUserForLogin(false);
    window.location.reload();
  };
  const [dragState, setDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false, // true for selecting, false for deselecting
    lastPosition: null,
  });

  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<
    calendar_v3.Schema$Event[]
  >([]);
  const [idsOfCurrentlySelectedGCals, setIdsOfCurrentlySelectedGCals] =
    useState<string[]>([]);
  const [googleCalendars, setGoogleCalendars] = useState<any[]>([]);

  const [shouldFillAvailability, setShouldFillAvailability] = useState(false);
  const [isFillingAvailability, setIsFillingAvailability] = useState(false);
  const [hasGCalScope, setHasGCalScope] = useState(
    localStorage.getItem('hasGCalScope') === 'true'
  );

  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // New state to track if calendar scope request is in progress
  const [isRequestingCalendarScope, setIsRequestingCalendarScope] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const uid = getAccountId();

      try {
        const lastSelectedGCalIds = await getSelectedCalendarIDsByUserID(uid);
        setIdsOfCurrentlySelectedGCals(lastSelectedGCalIds);

        if (hasAccess) {
          await fetchUserCalendars();
        }
      } catch (calendarError) {
        console.error('Error fetching calendar data:', calendarError);
      }
    };

    (async () => {
      try {
        await fetchData();

        if (getAccountName() === '' || getAccountName() === undefined) {
          setPromptUserForLogin(true);
        }
      } catch (err) {
        console.error('Unhandled error in data fetching:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isGeneralDays) return;

    // you need to injet dates into each column so later on
    const today = new Date();
    const getNextDayOccurrence = (targetDayNum: number): Date => {
      const date = new Date(today);
      const currentDayNum = today.getDay();

      let daysToAdd = targetDayNum - currentDayNum;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }

      date.setDate(date.getDate() + daysToAdd);
      return date;
    };

    const updatedDates = calendarFramework.dates.map((bucket) =>
      bucket.map((date) => {
        const dayMap: { [key: string]: number } = {
          SUN: 0,
          MON: 1,
          TUE: 2,
          WED: 3,
          THU: 4,
          FRI: 5,
          SAT: 6,
        };

        const dayNum = dayMap[date.shortenedWeekDay];
        const nextOccurrence = getNextDayOccurrence(dayNum);

        return {
          ...date,
          date: nextOccurrence,
          calanderDay: nextOccurrence.getDate().toString(),
          month: (nextOccurrence.getMonth() + 1).toString(),
          year: nextOccurrence.getFullYear().toString(),
          shortenedWeekDay: date.shortenedWeekDay,
        };
      })
    );

    setCalendarFramework((prev) => ({
      ...prev,
      dates: updatedDates,
    }));
  }, [isGeneralDays]);

  const fetchGoogleCalEvents = async (
    calIds: string[]
  ): Promise<calendar_v3.Schema$Event[]> => {
    if (!hasAccess || calIds.length === 0) return [];

    const dates = calendarFramework.dates.flat();
    const timeMin = dates[0]?.date?.toISOString() ?? new Date().toISOString();
    const timeMax = new Date(dates[dates.length - 1].date as Date).setUTCHours(
      23,
      59,
      59,
      999
    );

    const allEvents: calendar_v3.Schema$Event[] = [];

    for (const calId of calIds) {
      const events = await getEvents(
        calId,
        timeMin,
        new Date(timeMax).toISOString(),
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
    }

    setGoogleCalendarEvents(allEvents);
    return allEvents;
  };

  useEffect(() => {
    if (hasAccess && idsOfCurrentlySelectedGCals?.length >= 0) {
      fetchGoogleCalEvents(idsOfCurrentlySelectedGCals);
    }
  }, [
    googleCalendars,
    idsOfCurrentlySelectedGCals,
    hasAccess,
    shouldFillAvailability,
    calendarFramework.timezone,
  ]);

  // Fetch the user's Google Calendars
  const fetchUserCalendars = async () => {
    try {
      // if (!gapi || !isGapiInitialized) {
      //   await initializeGapi();

      //   // Check again after initialization attempt
      //   if (!gapi || !gapi.client || !gapi.client.calendar) {
      //     throw new Error('Failed to initialize Google Calendar API');
      //   }
      // }

      // Verify we have the calendar scope before attempting to fetch

      if (!hasAccess) {
        console.warn('Attempting to fetch calendars without proper scope');
        setHasGCalScope(false);
        return [];
      }

      const calendars = await getCalendars();

      setGoogleCalendars(calendars);
      return calendars;
    } catch (error) {
      console.error('Error fetching Google Calendars:', error);

      // Check if the error is scope-related and handle accordingly
      if (
        error instanceof Error &&
        (error.message.includes('scope') ||
          error.message.includes('permission') ||
          error.message.includes('unauthorized') ||
          error.message.includes('login required'))
      ) {
        setHasGCalScope(false);
        localStorage.setItem('hasGCalScope', 'false');
      }

      return [];
    }
  };

  // Check and maintain state about Google login and calendar permissions
  useEffect(() => {
    const checkGoogleAuthStatus = async () => {
      // First check if the user is logged into Google

      if (currentUser && hasAccess) {
        await fetchUserCalendars();
      }
    };

    checkGoogleAuthStatus();
  }, [currentUser, hasAccess]);

  const handleToggleGCalAvailabilitiesClick = async () => {
    if (!currentUser) {
      const user = await login();

      if (user) {
        updateAnonymousUserToAuthUser(getAccountName());

        // After login, check if we have calendar scope

        if (hasAccess) {
          await fetchUserCalendars();
          setGcalPopupOpen(true);
        } else {
          // Need to request calendar scope
          const scopeGranted = await requestAccess();
          if (scopeGranted) {
            setGcalPopupOpen(true);
          }
        }
      }
    } else {
      // Already logged in, check if we have calendar scope

      if (hasAccess) {
        // We have the scope, show calendar selection
        await fetchUserCalendars();
        setGcalPopupOpen(true);
      } else {
        const scopeGranted = await requestAccess();
        if (scopeGranted) {
          setGcalPopupOpen(true);
        }
      }
    }
  };

  function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  function isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  function doesBlockOverlapEvent(
    blockTime: string,
    blockDate: Date,
    event: calendar_v3.Schema$Event
  ): boolean {
    if (!event.start?.dateTime || !event.end?.dateTime) return false;

    // Create a proper ISO string with timezone info
    const eventStartISO =
      event.start.dateTime +
      (event.start.timeZone ? getTimezoneOffset(event.start.timeZone) : 'Z');
    const eventEndISO =
      event.end.dateTime +
      (event.end.timeZone ? getTimezoneOffset(event.end.timeZone) : 'Z');

    const eventStart = new Date(eventStartISO);
    const eventEnd = new Date(eventEndISO);

    if (!isSameDate(eventStart, blockDate)) return false;

    const blockStartMinutes = timeToMinutes(blockTime);
    const blockEndMinutes = blockStartMinutes + 15;
    const eventStartMinutes = dateToMinutes(eventStart);
    const eventEndMinutes = dateToMinutes(eventEnd);

    return (
      blockStartMinutes <= eventEndMinutes &&
      blockEndMinutes > eventStartMinutes
    );
  }

  function getTimezoneOffset(timezone: string): string {
    // This would need a proper timezone offset lookup
    // For now, hardcode common ones or use a library
    const offsets: { [key: string]: string } = {
      'Europe/Paris': '+02:00', // Summer time
      'America/Los_Angeles': '-07:00', // PDT
      UTC: 'Z',
    };
    return offsets[timezone] || 'Z';
  }

  function autofillAvailabilityFromCalendar(
    googleCalendarEvents: calendar_v3.Schema$Event[],
    dates: any[],
    timeBlocks: string[],
    currentAvailability: boolean[][]
  ): boolean[][] {
    const newAvailability = currentAvailability.map((col) => [...col]);

    for (let colIndex = 0; colIndex < dates.length; colIndex++) {
      const date = dates[colIndex].date;

      for (let blockIndex = 0; blockIndex < timeBlocks.length; blockIndex++) {
        const timeBlock = timeBlocks[blockIndex];

        const hasEvent = googleCalendarEvents.some((event) =>
          doesBlockOverlapEvent(timeBlock, date, event)
        );

        newAvailability[colIndex][blockIndex] = !hasEvent;
      }
    }

    return newAvailability;
  }

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

    setIsFillingAvailability(true);

    try {
      const calIds =
        idsOfCurrentlySelectedGCals.length > 0
          ? idsOfCurrentlySelectedGCals
          : await getSelectedCalendarIDsByUserID(getAccountId());

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
        calendarState[getCurrentUserIndex()]
      );

      const newCalendarState = { ...calendarState };
      newCalendarState[getCurrentUserIndex()] = newAvailability;
      setCalendarState(newCalendarState);
    } finally {
      setIsFillingAvailability(false);
      setGcalPopupOpen(false);
    }
  };

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      user =
        calendarState !== undefined ? Object.keys(calendarState).length - 1 : 0;
    }
    return user;
  };

  const saveAvailAndLocationChanges = () => {
    const user = getCurrentUserIndex();
    const avail: Availability = calendarState
      ? (calendarState[user] ?? [])
      : [];
    wrappedSaveParticipantDetails(avail, selectedLocations);
    setUserSelectedCalendarIDs(getAccountId(), idsOfCurrentlySelectedGCals);

    toggleEditing();
  };

  const handleSubmitAvailability = () => {
    saveAvailAndLocationChanges();
  };

  if (loading) {
    return (
      <div className="w-full h-[60%] flex flex-col items-center justify-center">
        <LoadingAnim />
        <p className="text-gray-500">Loading...</p>
        {showSlowMessage && (
          <p className="text-center text-gray-500">
            Your internet may be slow, or pop-ups may be disabled
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-0 lg:px-8 mb-5 lg:mb-0">
      <div className="lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col">
        <div
          className="lg:p-0 p-4 lg:ml-5 lg:mt-5 lg:col-span-1 gap-y-3 flex flex-col lg:items-start lg:justify-start
           items-center justify-center mb-3 text-text dark:text-text-dark"
        >
          <div
            className="text-4xl font-bold text-center lg:text-left"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {eventName}
          </div>
          <div
            className="text-xl text-center lg:text-left"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {eventDescription}
          </div>

          <CopyCodeButton />

          <ButtonSmall
            bgColor="primary"
            textColor="white"
            onClick={toggleEditing}
          >
            {isEditing ? 'View Availabilities' : 'Edit Your Availability'}
          </ButtonSmall>

          {locationOptions.length > 0 && (
            <div className="w-full z-50">
              <LocationSelectionComponent
                locations={locationOptions}
                update={setSelectedLocations}
              />
            </div>
          )}

          <div className="hidden lg:flex flex-col w-full bg-secondary_background dark:bg-secondary_background-dark p-4 py-2 rounded-lg">
            <h2 className="text-md font-semibold text-gray-600 dark:text-gray-300">
              Your Calendars
            </h2>
            {currentUser && hasAccess ? (
              <ul className="space-y-1 max-h-80 overflow-y-auto">
                {googleCalendars.map((cal) => (
                  <li
                    key={cal.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    onClick={() => {
                      setIdsOfCurrentlySelectedGCals((prevState) => {
                        if (prevState?.includes(cal.id)) {
                          return prevState.filter((id) => id !== cal.id);
                        } else {
                          return [...(prevState || []), cal.id];
                        }
                      });
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm mr-3 flex-shrink-0 flex items-center justify-center ${
                        idsOfCurrentlySelectedGCals?.includes(cal.id)
                          ? 'bg-primary dark:bg-blue-700'
                          : 'bg-transparent'
                      } border border-gray-400 dark:border-gray-600`}
                    >
                      {idsOfCurrentlySelectedGCals?.includes(cal.id) && (
                        <IconCheck size={12} color="white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {cal.summary}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Grant permission to import your calendars
                </p>

                <button
                  className="font-bold rounded-full shadow-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 py-2 px-4 text-sm
                  flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                  onClick={async () => {
                    if (currentUser && !hasAccess) {
                      // alr logged in, need more scopes

                      await requestAccess();
                    } else {
                      login().then(async (loginSuccessful) => {
                        if (loginSuccessful !== undefined) {
                          updateAnonymousUserToAuthUser(getAccountName());
                          await requestAccess();
                        }
                      });
                    }
                  }}
                >
                  <img src={LOGO} alt="Logo" className="mr-2 h-5" />
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="w-full">
            <div className="flex flex-col space-y-0 mb-2">
              <div className="flex justify-center ml-2 mr-2 md:justify-start md:ml-5 md:mr-5 md:mt-5 mb-2">
                {/* Mobile layout */}
                <div className="w-full flex flex-col gap-4 md:hidden">
                  {currentUser && hasAccess ? (
                    <div className="flex gap-2 w-full">
                      <ButtonSmall
                        bgColor="primary"
                        textColor="white"
                        themeGradient={false}
                        onClick={handleToggleGCalAvailabilitiesClick}
                        className="flex-1 !rounded-lg"
                      >
                        Show GCal Events
                      </ButtonSmall>
                      <ButtonSmall
                        bgColor="primary"
                        textColor="white"
                        themeGradient={false}
                        onClick={handleAutofillAvailabilityClick}
                        className="flex-1 !rounded-lg"
                      >
                        Autofill Availability
                      </ButtonSmall>
                    </div>
                  ) : (
                    <button
                      className="font-bold rounded-full shadow-md bg-white text-gray-600 py-3 px-4 text-sm
                      flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                      onClick={async () => {
                        if (!hasAccess) {
                          // alr logged in, need more scopes
                          await requestAccess();
                          // .then(() =>
                          //   window.location.reload()
                          // );
                        } else {
                          login()
                            .then((User) => {
                              updateAnonymousUserToAuthUser(getAccountName());
                              requestAccess();
                              // .then(() =>
                              //   window.location.reload()
                              // );
                            })
                            .catch((error) => {
                              console.error('Error during login:', error);
                            });
                        }
                      }}
                    >
                      <img src={LOGO} alt="Logo" className="mr-2 h-5" />
                      Grant permission to import your calendars
                    </button>
                  )}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <TimezoneChanger
                        theCalendarFramework={[
                          calendarFramework,
                          setCalendarFramework,
                        ]}
                        initialTimezone={getUserTimezone()}
                      />
                    </div>
                    <ButtonSmall
                      bgColor="primary"
                      textColor="white"
                      themeGradient={true}
                      onClick={handleSubmitAvailability}
                    >
                      <span>&nbsp;</span> Save <span>&nbsp;</span>
                    </ButtonSmall>
                  </div>
                </div>

                {/* Desktop layout - unchanged */}
                <div className="hidden md:flex w-full max-w-full justify-between items-center space-x-2">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      {currentUser ? (
                        <>
                          <ButtonSmall
                            bgColor="primary"
                            textColor="white"
                            themeGradient={false}
                            onClick={handleToggleGCalAvailabilitiesClick}
                            className="lg:hidden !rounded-lg"
                          >
                            Show GCal Events
                          </ButtonSmall>
                          <ButtonSmall
                            bgColor="primary"
                            textColor="white"
                            themeGradient={false}
                            onClick={handleAutofillAvailabilityClick}
                            className="!rounded-lg mr-2"
                          >
                            Autofill Availability
                          </ButtonSmall>
                        </>
                      ) : (
                        <button
                          className="lg:hidden font-bold rounded-full shadow-md bg-white text-gray-600 py-3 px-4 text-sm
                          flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                          onClick={() => {
                            login()
                              .then((User) => {
                                updateAnonymousUserToAuthUser(getAccountName());
                              })
                              .catch((error) => {
                                console.error('Error during login:', error);
                              });
                          }}
                        >
                          <img src={LOGO} alt="Logo" className="mr-2 h-5" />
                          Sign in to access GCal
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <TimezoneChanger
                        theCalendarFramework={[
                          calendarFramework,
                          setCalendarFramework,
                        ]}
                        initialTimezone={getUserTimezone()}
                      />
                    </div>
                  </div>

                  <ButtonSmall
                    bgColor="primary"
                    textColor="white"
                    themeGradient={true}
                    onClick={handleSubmitAvailability}
                  >
                    <span>&nbsp;</span> Save <span>&nbsp;</span>
                  </ButtonSmall>
                </div>
              </div>

              <Calendar
                theShowUserChart={undefined}
                onClick={() => {}}
                theCalendarState={[calendarState, setCalendarState]}
                user={getCurrentUserIndex()}
                theCalendarFramework={[calendarFramework, setCalendarFramework]}
                draggable={true}
                chartedUsersData={undefined}
                theDragState={[dragState, setDragState]}
                isAdmin={false}
                theGoogleCalendarEvents={[
                  googleCalendarEvents,
                  setGoogleCalendarEvents,
                ]}
                isGeneralDays={isGeneralDays}
              />
            </div>
          </div>
        </div>
      </div>
      {/* For Mobile */}
      <AddGoogleCalendarPopup
        isOpen={isGcalPopupOpen}
        onClose={closeGcalPopup}
        // onCloseAndAutofillAndSubmit={onPopupCloseAutofillAndSubmit}
        isFillingAvailability={isFillingAvailability}
      >
        <h2 className="text-xl font-bold mb-4">My Calendars</h2>
        <ul className="space-y-1">
          {googleCalendars.map((cal) => (
            <li
              key={cal.id}
              className="flex items-center py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => {
                setIdsOfCurrentlySelectedGCals((prevState) => {
                  if (prevState?.includes(cal.id)) {
                    return prevState.filter((id) => id !== cal.id);
                  } else {
                    return [...(prevState || []), cal.id];
                  }
                });
              }}
            >
              <div
                className={`w-4 h-4 rounded-sm mr-3 flex-shrink-0 flex items-center justify-center ${
                  idsOfCurrentlySelectedGCals?.includes(cal.id)
                    ? 'bg-primary dark:bg-blue-700'
                    : 'bg-transparent'
                } border border-gray-400`}
              >
                {idsOfCurrentlySelectedGCals?.includes(cal.id) && (
                  <IconCheck size={12} color="white" />
                )}
              </div>
              <span className="text-sm text-gray-800 truncate">
                {cal.summary}
              </span>
            </li>
          ))}
        </ul>
      </AddGoogleCalendarPopup>
      {promptUserForLogin && (
        <LoginPopup
          onClose={endPromptUserForLogin}
          enableAnonymousSignIn={true}
          code={code || ''}
        />
      )}
    </div>
  );
}

export default TimeSelectPage;

import LocationSelectionComponent from './LocationSelectionComponent';
import { calendar_v3 } from 'googleapis';
import { useState, useEffect } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import { signInWithCredential } from 'firebase/auth';
import {
  calanderState,
  userData,
  calendarDimensions,
  Availability,
  calandarDate,
  dragProperties,
} from '../../types';
import eventAPI from '../../firebase/eventAPI';
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
  getTimezone,
  updateAnonymousUserToAuthUser,
  getSelectedCalendarIDsByUserID,
  setUserSelectedCalendarIDs,
} from '../../firebase/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { AddGoogleCalendarPopup } from '../utils/components/AddGoogleCalendarPopup';
import { LoginPopup } from '../utils/components/LoginPopup/login_guest_popup';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import LOGO from '../DaySelect/general_popup_component/googlelogo.png';

import { useContext } from 'react';
import ButtonSmall from '../utils/components/ButtonSmall';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { auth } from '../../firebase/firebase';
import { IconCheck } from '@tabler/icons-react'; // Added IconAlertCircle
import { useAuth } from '../../firebase/authContext';
import { useGoogleCalendar } from '../../firebase/useGoogleCalService';

/**
 *
 * @returns Page Component
 */
function TimeSelectPage() {
  const { code } = useParams();
  const { login, currentUser } = useAuth();
  const {
    hasAccess,
    initialized,
    requestAccess,
    getCalendars,
    getEvents,
    disconnect,
  } = useGoogleCalendar();
  const [isGcalPopupOpen, setGcalPopupOpen] = useState(false);

  const nav = useNavigate();

  const closeGcalPopup = () => {
    setGcalPopupOpen(false);
  };

  const navigate = useNavigate();
  const [chartedUsers, setChartedUsers] = useState<userData | undefined>(
    undefined
  );

  const [calendarState, setCalendarState] = useState<calanderState>([]);
  const [calendarFramework, setCalendarFramework] =
    useState<calendarDimensions>({
      dates: [],
      startTime: new Date(),
      endTime: new Date(),
      numOfBlocks: 0,
      numOfCols: 0,
    });

  const [selectedLocations, updateSelectedLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [locationOptions, setLocationOptions] = useState(Array<string>);
  const [promptUserForLogin, setPromptUserForLogin] = useState(false);

  // hook that handles whether or not we are working with dates, or just selecting days of the week
  const [areSelectingGeneralDays, setAreSelectingGeneralDays] = useState(false);

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

  // const {
  //   gapi,
  //   isGapiInitialized,
  //   initializeGapi,
  //   GAPILoading,
  //   handleIsSignedIn,
  // } = useContext(GAPIContext);

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

  // New state to track if calendar scope request is in progress
  const [isRequestingCalendarScope, setIsRequestingCalendarScope] =
    useState(false);

  const [hasAvailability, setHasAvailability] = useState(false);
  const [isGeneralDays, setIsGeneralDays] = useState(
    calendarFramework?.dates?.[0]?.[0]?.date?.getFullYear() === 2000
  );

  useEffect(() => {
    const fetchData = async () => {
      // Check if code is valid
      if (!code || code.length !== 6) {
        console.error("The event code in the URL doesn't exist");
        nav('/notfound');
        return false;
      }

      try {
        // Main event loading
        await getEventOnPageload(code);

        const { availabilities, participants } = eventAPI.getCalendar();
        const dim = eventAPI.getCalendarDimensions();
        const uid = getAccountId();

        if (dim === undefined) {
          nav('/notfound');
          return false;
        }

        // Handle account details
        const accountName = getAccountName();
        if (accountName === null) {
          return false;
        }

        // Setup availability
        let avail: Availability | undefined =
          uid !== ''
            ? getAvailabilityByAccountId(uid)
            : getAvailabilityByName(accountName);

        if (avail === undefined) {
          avail = eventAPI.getEmptyAvailability(dim);
        } else {
          setHasAvailability(true);
        }

        // Update state with event data
        setChartedUsers(participants);
        setEventName(getEventName());
        setEventDescription(getEventDescription());
        setLocationOptions(getLocationOptions());

        const theRange = getChosenDayAndTime();
        const isGeneralDaysSelection =
          dim?.dates[0][0].date?.getFullYear() === 2000 &&
          theRange === undefined;

        setIsGeneralDays(isGeneralDaysSelection);
        setCalendarState([...availabilities, avail]);
        setCalendarFramework(dim);
        setAreSelectingGeneralDays(isGeneralDaysSelection);

        // Navigate to group view if a selection is already made
        if (theRange !== undefined && theRange[0].getFullYear() !== 1970) {
          nav('/groupview/' + code);
          return true;
        }

        try {
          const lastSelectedGCalIds = await getSelectedCalendarIDsByUserID(uid);
          setIdsOfCurrentlySelectedGCals(lastSelectedGCalIds);

          if (hasAccess) {
            await fetchUserCalendars();
          }
        } catch (calendarError) {
          console.error('Error fetching calendar data:', calendarError);
        }

        return true;
      } catch (error) {
        console.error('Error loading event:', error);
        nav('/notfound');
        return false;
      }
    };

    // Execute the main data fetching function and handle final states
    (async () => {
      try {
        setLoading(true);
        const success = await fetchData();

        if (
          success &&
          (getAccountName() === '' || getAccountName() === undefined)
        ) {
          setPromptUserForLogin(true);
        }
      } catch (err) {
        console.error('Unhandled error in data fetching:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  // useEffect(() => {
  //   fetchGoogleCalEvents(idsOfCurrentlySelectedGCals, false);
  // }, [googleCalendars, idsOfCurrentlySelectedGCals]);

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
    calIds: string[],
    fillAvailability = false
  ) => {
    try {
      // Check if we have the required scope first

      if (!hasAccess) {
        setGoogleCalendarEvents([]);
        return;
      }

      const theDates: calandarDate[] = ([] as calandarDate[]).concat(
        ...(calendarFramework?.dates || [])
      );
      const parsedEvents: any[] = [];

      if (calIds.length === 0) {
        setGoogleCalendarEvents([]);
        if (fillAvailability)
          fillAvailabilityNotInGCalEvents(parsedEvents, theDates);
        return;
      }

      // Calculate time range based on whether it's general days or not
      let timeMin: string;
      let timeMax: string;

      if (isGeneralDays) {
        const today = new Date();
        timeMin = new Date(today.setUTCHours(0, 0, 0, 0)).toISOString();

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        timeMax = new Date(nextWeek.setUTCHours(23, 59, 59, 999)).toISOString();
      } else {
        timeMin = theDates[0]?.date?.toISOString() ?? new Date().toISOString();
        const timeMaxDate = new Date(
          theDates[theDates.length - 1].date as Date
        );
        timeMax = new Date(
          timeMaxDate.setUTCHours(23, 59, 59, 999)
        ).toISOString();
      }

      for (let i = 0; i < calIds.length; i++) {
        // const eventList = await gapi?.client?.calendar?.events?.list({
        //   calendarId: calIds[i],
        //   timeMin,
        //   timeMax,
        //   singleEvents: true,
        //   orderBy: 'startTime',
        // });

        const theEvents = await getEvents(calIds[i], timeMin, timeMax);

        for (let event of theEvents) {
          const startDate = new Date(
            event?.start?.dateTime || (event.start as any)?.date || ''
          );
          const endDate = new Date(
            event?.end?.dateTime || (event.end as any)?.date || ''
          );

          if (startDate.getDay() !== endDate.getDay()) {
            continue; // Skip events that span multiple days
          }

          parsedEvents.push(event);
        }
      }

      setGoogleCalendarEvents([...parsedEvents]);

      if (fillAvailability) {
        fillAvailabilityNotInGCalEvents(parsedEvents, theDates);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      if (
        error instanceof Error &&
        (error.message.includes('scope') ||
          error.message.includes('permission'))
      ) {
        setHasGCalScope(false);
      }
    }
  };

  useEffect(() => {
    if (hasAccess && idsOfCurrentlySelectedGCals?.length >= 0) {
      fetchGoogleCalEvents(idsOfCurrentlySelectedGCals, shouldFillAvailability);
    }
  }, [
    googleCalendars,
    idsOfCurrentlySelectedGCals,
    hasAccess,
    shouldFillAvailability,
  ]);

  const fillAvailabilityNotInGCalEvents = (
    parsedEvents: any[],
    dates: calandarDate[]
  ) => {
    const userIndex = getCurrentUserIndex();
    const oldCalendarState = { ...calendarState };
    const userAvailability = oldCalendarState[userIndex];

    const startHour = calendarFramework?.startTime.getHours();
    const startMinute = calendarFramework?.startTime.getMinutes();

    const endHour = calendarFramework?.endTime.getHours();
    const endMinute = calendarFramework?.endTime.getMinutes();

    const totalMinutes =
      endHour !== undefined &&
      startHour !== undefined &&
      endMinute !== undefined &&
      startMinute !== undefined
        ? (endHour - startHour) * 60 + (endMinute - startMinute)
        : 0;
    const totalBlocks = totalMinutes / 15; // Assuming 15-minute intervals

    const timeBlocks = generateTimeBlocks(
      calendarFramework?.startTime,
      calendarFramework?.endTime
    );
    const times: string[] = ([] as string[]).concat(...timeBlocks);

    for (let columnID = 0; columnID < dates.length; columnID++) {
      const dateObj = dates[columnID];
      for (let blockID = 0; blockID < totalBlocks; blockID++) {
        const timeString = times[blockID];
        const [hours, minutes] = timeString
          ? timeString.split(':').map(Number)
          : [0, 0];

        const startDateTime = new Date(dateObj.date as Date);
        startDateTime.setHours(hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime.getTime() + 15 * 60 * 1000);

        const overlapsGCalEvent = parsedEvents.some((event) => {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);

          return startDateTime < eventEnd && endDateTime > eventStart;
        });

        if (!overlapsGCalEvent) {
          userAvailability[columnID][blockID] = true;
        } else {
          userAvailability[columnID][blockID] = false;
        }
      }
    }

    oldCalendarState[userIndex] = userAvailability;
    setCalendarState(oldCalendarState as typeof calendarState);
    setShouldFillAvailability(false);
    setIsFillingAvailability(false);
    setGcalPopupOpen(false);
  };

  // const checkIfUserHasCalendarScope = async (): Promise<boolean> => {
  //   if (!gapi || !isGapiInitialized) {
  //     console.error('GAPI not initialized');
  //     return false;
  //   }

  //   try {
  //     const authInstance = gapi.auth2.getAuthInstance();

  //     if (!authInstance) {
  //       console.error('Auth instance not initialized');
  //       return false;
  //     }

  //     const currentUser = authInstance.currentUser.get();

  //     if (!currentUser) {
  //       console.error('Current user not available');
  //       return false;
  //     }

  //     // Check if the calendar scope is granted
  //     const hasCalendarScope = currentUser.hasGrantedScopes(
  //       'https://www.googleapis.com/auth/calendar.readonly'
  //     );

  //     // As an additional verification, try to make a test call to the Calendar API
  //     if (hasCalendarScope) {
  //       try {
  //         // Try to get a calendar list with a small maxResults to minimize data transfer
  //         const response = await gapi.client.calendar.calendarList.list({
  //           maxResults: 1,
  //         });

  //         // If we get here, we definitely have calendar access
  //         localStorage.setItem('hasGCalScope', 'true');
  //         return true;
  //       } catch (error) {
  //         // If this fails, we might not have proper access despite what hasGrantedScopes says
  //         console.error('Calendar API test call failed:', error);
  //         localStorage.setItem('hasGCalScope', 'false');
  //         return false;
  //       }
  //     }

  //     localStorage.setItem('hasGCalScope', String(hasCalendarScope));
  //     return hasCalendarScope;
  //   } catch (error) {
  //     console.error('Error checking calendar scope:', error);
  //     localStorage.setItem('hasGCalScope', 'false');
  //     return false;
  //   }
  // };

  // const requestCalendarScope = async (): Promise<boolean> => {
  //   setIsRequestingCalendarScope(true);

  //   try {
  //     if (!gapi || !isGapiInitialized) {
  //       await initializeGapi();
  //     }

  //     const auth2 = gapi?.auth2.getAuthInstance();

  //     if (!auth2) {
  //       throw new Error('Google Auth instance not initialized');
  //     }

  //     const isSignedIn = auth2.isSignedIn.get();

  //     if (!isSignedIn) {
  //       // If not signed in, sign them in with the calendar scope included
  //       await login();
  //     } else {
  //       // User is already signed in, request additional scopes
  //       try {
  //         // Request calendar scope specifically, force consent prompt to show
  //         const result = await auth2.currentUser.get().grant({
  //           scope: 'https://www.googleapis.com/auth/calendar.readonly',
  //           prompt: 'consent',
  //         });

  //         // Get the updated token with new scopes
  //         const authResponse = result.getAuthResponse(true);

  //         // Important: Update the token in gapi.client for API calls
  //         gapi?.client.setToken({
  //           access_token: authResponse.access_token,
  //         });

  //         // Update Firebase credential with new tokens if using Firebase
  //         const credential = GoogleAuthProvider.credential(
  //           authResponse.id_token,
  //           authResponse.access_token
  //         );
  //         await signInWithCredential(auth, credential);
  //       } catch (error) {
  //         console.error('Error granting calendar scope:', error);
  //         return false;
  //       }
  //     }

  //     // Verify the scope was granted

  //     if (hasAccess) {
  //       // If we got the scope, immediately fetch calendars
  //       await fetchUserCalendars();
  //       return true;
  //     }

  //     return false;
  //   } catch (error) {
  //     console.error('Error requesting calendar scope:', error);
  //     return false;
  //   } finally {
  //     setIsRequestingCalendarScope(false);
  //   }
  // };

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
        // Need to request calendar scope
        const scopeGranted = await requestAccess();
        if (scopeGranted) {
          setGcalPopupOpen(true);
        }
      }
    }
  };

  const handleAutofillAvailabilityClick = async () => {
    // Check if the user is logged into Google
    if (!currentUser) {
      // Need to sign in first
      const user = (await login()) != undefined;

      if (!user) {
        return;
      }
      updateAnonymousUserToAuthUser(getAccountName());
    }

    // Check if we have calendar scope
    let justGrantedScope = false;
    if (!hasAccess) {
      // Need to request calendar scope
      const scopeGranted = await requestAccess();
      if (!scopeGranted) {
        return;
      }
      justGrantedScope = true;
    }

    // Now we can proceed with autofill
    setShouldFillAvailability(true);
    setIsFillingAvailability(true);

    const lastSelectedGCalIds =
      await getSelectedCalendarIDsByUserID(getAccountId());
    if (justGrantedScope) {
      setIdsOfCurrentlySelectedGCals(lastSelectedGCalIds);
    }

    // Fetch calendar data and use it for
    await fetchGoogleCalEvents(
      idsOfCurrentlySelectedGCals.length > 0
        ? idsOfCurrentlySelectedGCals
        : justGrantedScope === true
          ? lastSelectedGCalIds
          : [],
      true
    );
  };

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      // new user => last availability
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
  };

  const handleSubmitAvailability = () => {
    saveAvailAndLocationChanges();
    setUserSelectedCalendarIDs(getAccountId(), idsOfCurrentlySelectedGCals);
    navigate(`/groupview/${code}`);
  };

  if (loading) {
    return (
      <div className="w-full h-[60%] flex flex-col items-center justify-center">
        <LoadingAnim />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-0 lg:px-8 lg:px-12 mb-5 lg:mb-0">
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
          {locationOptions.length > 0 && (
            <div className="w-full z-50">
              <LocationSelectionComponent
                locations={locationOptions}
                update={updateSelectedLocations}
              />
            </div>
          )}
          <CopyCodeButton />

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
                          // .then(() =>
                          //   window.location.reload()
                          // );
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
                        initialTimezone={
                          getTimezone()
                            ? getTimezone()
                            : Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
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
                        initialTimezone={
                          getTimezone()
                            ? getTimezone()
                            : Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
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

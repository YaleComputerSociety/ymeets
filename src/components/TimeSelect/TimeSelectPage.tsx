import LocationSelectionComponent from './LocationSelectionComponent';
import { calendar_v3 } from 'googleapis';
import { useState, useEffect } from 'react';
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
} from '../../firebase/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { AddGoogleCalendarPopup } from '../utils/components/AddGoogleCalendarPopup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { LoginPopup } from '../utils/components/LoginPopup/login_guest_popup';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import { signInWithGoogle } from '../../firebase/auth';
import LOGO from '../DaySelect/general_popup_component/googlelogo.png';
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import ButtonSmall from '../utils/components/ButtonSmall';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import CopyCodeButton from '../utils/components/CopyCodeButton';

/**
 *
 * @returns Page Component
 */
function TimeSelectPage() {
  const { code } = useParams();
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

  const gapiContext = useContext(GAPIContext);
  const { gapi, handleIsSignedIn } = gapiContext;

  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<
    calendar_v3.Schema$Event[]
  >([]);
  // const [googleCalIds, setGoogleCalIds] = useState<string[]>(['primary']);
  const [googleCalIds, setGoogleCalIds] = useState<string[]>([]); // still easy for user to specify primary cal?
  const [googleCalendars, setGoogleCalendars] = useState<any[]>([]);
  const [selectedPopupIds, setSelectedPopupIds] = useState<string[]>([]);

  const [shouldFillAvailability, setShouldFillAvailability] = useState(false);
  const [isFillingAvailability, setIsFillingAvailability] = useState(false);

  const [hasAvailability, setHasAvailability] = useState(false);

  const getGoogleCalData = async (
    calIds: string[],
    fillAvailability = false
  ) => {
    try {
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

      const timeMaxDate = new Date(theDates[theDates.length - 1].date as Date);
      const timeMax = new Date(
        timeMaxDate.setUTCHours(23, 59, 59, 999)
      ).toISOString();

      for (let i = 0; i < calIds.length; i++) {
        const eventList = await gapi?.client?.calendar?.events?.list({
          calendarId: calIds[i],
          timeMin: theDates[0]?.date?.toISOString(),
          timeMax: timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const theEvents = eventList?.result?.items || [];

        for (let event of theEvents) {
          const startDate = new Date(
            event?.start?.dateTime || event?.start?.date || ''
          );
          const endDate = new Date(
            event?.end?.dateTime ?? event?.end?.date ?? ''
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
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (gapi) {
        await getGoogleCalData(googleCalIds, shouldFillAvailability);
      } else {
        return;
      }
    };
    fetchData();
  }, [gapi, googleCalIds]);

  const fetchUserCals = async () => {
    return await new Promise((resolve, reject) => {
      gapi?.client?.calendar?.calendarList
        .list()

        .then((response) => {
          const calendars = response.result.items;
          resolve(calendars);
        })

        .catch((error) => {
          reject(error);
        });
    });
  };

  const onPopupCloseAndSubmit = async () => {
    if (selectedPopupIds === googleCalIds) {
      setGcalPopupOpen(false);
      return;
    }
    setGoogleCalIds(selectedPopupIds);
    setGcalPopupOpen(false);
  };

  const onPopupCloseAutofillAndSubmit = async () => {
    setShouldFillAvailability(true);
    setIsFillingAvailability(true);
    if (selectedPopupIds === googleCalIds) {
      await getGoogleCalData(selectedPopupIds, true);
    } else {
      setGoogleCalIds(selectedPopupIds);
    }
  };

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
        const [hours, minutes] = timeString.split(':').map(Number);

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

  useEffect(() => {
    const fetchData = async () => {
      if (code && code.length === 6) {
        await getEventOnPageload(code).then(() => {
          const { availabilities, participants } = eventAPI.getCalendar();
          const dim = eventAPI.getCalendarDimensions();

          if (dim == undefined) {
            nav('/notfound');
          }

          const accountName = getAccountName();
          if (accountName === null) {
            return;
          }

          let avail: Availability | undefined =
            getAccountId() !== ''
              ? getAvailabilityByAccountId(getAccountId())
              : getAvailabilityByName(accountName);

          if (avail === undefined) {
            avail = eventAPI.getEmptyAvailability(dim);
          } else {
            setHasAvailability(true);
          }

          setChartedUsers(participants);

          setEventName(getEventName());
          setEventDescription(getEventDescription());
          setLocationOptions(getLocationOptions());

          const theRange = getChosenDayAndTime();

          setCalendarState([...availabilities, avail]);
          setCalendarFramework(dim);

          /* The first date having a year be 2000 means that it was a general days selection */
          setAreSelectingGeneralDays(
            dim?.dates[0][0].date?.getFullYear() == 2000 &&
              theRange === undefined
          );

          // if there's a selection already made, nav to groupview since you're not allowed to edit ur avail
          if (theRange != undefined && theRange[0].getFullYear() != 1970) {
            nav('/groupview/' + code);
          }
        });
      } else {
        console.error("The event code in the URL doesn't exist");
        nav('/notfound');
      }
    };

    fetchData()
      .then(() => {
        if (getAccountName() == '' || getAccountName() == undefined) {
          setPromptUserForLogin(true);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60%] flex flex-col items-center justify-center">
        <LoadingAnim />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Check if the user has the required Google Calendar scope
  const checkIfUserHasCalendarScope = async (): Promise<boolean> => {
    const currentScopes =
      gapi?.auth2?.getAuthInstance()?.currentUser?.get()?.getGrantedScopes() ||
      '';
    return currentScopes.includes(
      'https://www.googleapis.com/auth/calendar.readonly'
    );
  };

  // Request additional scopes if necessary
  const requestAdditionalScopes = async () => {
    try {
      await gapi?.auth2
        .getAuthInstance()
        .grantOfflineAccess({
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          prompt: 'consent',
        })
        .then(async (response) => {
          if (response.code) {
            await signInWithGoogle(response.code, gapi, handleIsSignedIn);
            fetchUserCalendars();
          } else {
            console.error('Failed to grant additional permissions.');
          }
        });
    } catch (error) {
      console.error('Error during scope request:', error);
    }
  };

  // Fetch the user's Google Calendars
  const fetchUserCalendars = async () => {
    try {
      const response = await gapi?.client?.calendar?.calendarList.list();
      const calendars = response?.result.items;
      if (calendars !== undefined) {
        setGoogleCalendars(calendars);
        setGcalPopupOpen(true);
      }
    } catch (error) {
      console.error('Error fetching Google Calendars:', error);
    }
  };

  const handleToggleGCalAvailabilitiesClick = async () => {
    if (await checkIfUserHasCalendarScope()) {
      fetchUserCalendars();
    } else {
      requestAdditionalScopes().then(() => {
        fetchUserCalendars();
      });
    }
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
    navigate(`/groupview/${code}`);
  };

  const handleSubmitAvailability = () => {
    saveAvailAndLocationChanges();
  };

  return (
    <div className="w-full px-0 lg:px-8 lg:px-12 mb-5 lg:mb-0">
      <div className="lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col">
        <div
          className="lg:p-0 p-4 lg:ml-5 lg:mt-5 lg:col-span-1 gap-y-3 flex flex-col lg:items-start lg:justify-start
           items-center justify-center mb-3 text-text dark:text-text-dark"
        >
          <div className="text-4xl font-bold text-center lg:text-left">
            {eventName}
          </div>
          <div className="text-xl text-center lg:text-left">
            {eventDescription}
          </div>
          {locationOptions.length > 0 && (
            <div className="w-full z-[9999]">
              <LocationSelectionComponent
                locations={locationOptions}
                update={updateSelectedLocations}
              />
            </div>
          )}
          <CopyCodeButton />
        </div>
        <div className="lg:col-span-3">
          <div className="w-full">
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
            />
          </div>
          <div className="flex flex-row justify-between mb-3">
            {!areSelectingGeneralDays && getAccountId() !== '' ? (
              <div className="pl-5 z-60 mb-4 lg:mb-0">
                <div className="hidden lg:flex">
                  <ButtonSmall
                    bgColor="primary"
                    textColor="white"
                    onClick={handleToggleGCalAvailabilitiesClick}
                  >
                    Show GCal Events
                  </ButtonSmall>
                </div>
                <div className="lg:hidden flex">
                  <ButtonSmall
                    bgColor="primary"
                    textColor="white"
                    onClick={handleToggleGCalAvailabilitiesClick}
                  >
                    Show GCal Events
                  </ButtonSmall>
                </div>
              </div>
            ) : (
              !areSelectingGeneralDays && (
                <div className="lg:pl-4 mb-4 lg:mb-0">
                  <button
                    className="w-full lg:w-auto font-bold rounded-full shadow-md bg-white text-gray-600 py-3 px-4 text-sm lg:text-base
                            flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                    onClick={() => {
                      signInWithGoogle(undefined, gapi, handleIsSignedIn).then(
                        (loginSuccessful) => {
                          if (loginSuccessful) {
                            window.location.reload();
                          } else {
                            console.error('login failed');
                          }
                        }
                      );
                    }}
                  >
                    <img src={LOGO} alt="Logo" className="mr-2 h-5 lg:h-6" />
                    Sign in with Google to access GCal
                  </button>
                </div>
              )
            )}
            <div className="pr-5">
              <ButtonSmall
                bgColor="primary"
                textColor="white"
                onClick={handleSubmitAvailability}
              >
                Next <span className="ml-1">&#8594;</span>
              </ButtonSmall>
            </div>
          </div>
        </div>
      </div>
      <AddGoogleCalendarPopup
        isOpen={isGcalPopupOpen}
        onClose={closeGcalPopup}
        onCloseAndSubmit={onPopupCloseAndSubmit}
        onCloseAndAutofillAndSubmit={onPopupCloseAutofillAndSubmit}
        isFillingAvailability={isFillingAvailability}
      >
        <h2 className="text-2xl font-bold mb-4">Select GCals</h2>
        <FormGroup>
          {googleCalendars.map((cal: any) => (
            <FormControlLabel
              key={cal.id}
              control={
                <Checkbox checked={selectedPopupIds?.includes(cal.id)} />
              }
              label={cal.summary}
              onChange={() => {
                setSelectedPopupIds((prevState) => {
                  if (prevState?.includes(cal.id)) {
                    return prevState.filter((id) => id !== cal.id);
                  } else {
                    return [...(prevState || []), cal.id];
                  }
                });
              }}
            />
          ))}
        </FormGroup>
      </AddGoogleCalendarPopup>
      {promptUserForLogin && (
        <LoginPopup
          onClose={endPromptUserForLogin}
          enableAnonymousSignIn={true}
        />
      )}
    </div>
  );
}

export default TimeSelectPage;

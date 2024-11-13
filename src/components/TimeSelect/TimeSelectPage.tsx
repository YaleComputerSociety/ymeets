/* eslint-disable */

import { LocationSelectionComponent } from './LocationSelectionComponent';
import { useState, useEffect } from 'react';
import {
  calanderState,
  userData,
  calendarDimensions,
  Availability,
  calandarDate,
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
  checkIfLoggedIn,
  getChosenDayAndTime,
} from '../../firebase/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { Popup } from '../utils/components/Popup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { LoginPopup } from '../utils/components/LoginPopup/login_guest_popup';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import { signInWithGoogle } from '../../firebase/auth';
import LOGO from '../DaySelect/general_popup_component/googlelogo.png';
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import Button from '../utils/components/Button';
import ButtonSmall from '../utils/components/ButtonSmall';
import InformationPopup from '../utils/components/InformationPopup';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';

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
  const [calendarState, setCalendarState] = useState<calanderState | undefined>(
    undefined
  );
  const [calendarFramework, setCalendarFramework] = useState<
    calendarDimensions | undefined
  >(undefined);

  const [selectedLocations, updateSelectedLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [locationOptions, setLocationOptions] = useState(Array<string>);

  const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState([]);
  const [promptUserForLogin, setPromptUserForLogin] = useState(false);

  // hook that handles whether or not we are working with dates, or just selecting days of the week
  const [areSelectingGeneralDays, setAreSelectingGeneralDays] = useState(false);

  const endPromptUserForLogin = () => {
    setPromptUserForLogin(false);
    window.location.reload();
  };

  const [dragState, setDragState] = useState({
    dragStartedOnID: [], // [columnID, blockID]
    dragEndedOnID: [],
    dragStartedOn: false,
    affectedBlocks: new Set(),
  });

  const gapiContext = useContext(GAPIContext);
  const { gapi, handleIsSignedIn } = gapiContext;

  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);
  const [googleCalIds, setGoogleCalIds] = useState<string[]>(['primary']);
  const [googleCalendars, setGoogleCalendars] = useState<any[]>([]);
  const [selectedPopupIds, setSelectedPopupIds] = useState<string[]>();

  const [shouldFillAvailability, setShouldFillAvailability] = useState(false);
  const [isFillingAvailability, setIsFillingAvailability] = useState(false);

  useEffect(() => {
    const getGoogleCalData = async (calIds: string[]) => {
      try {
        // @ts-expect-error
        const theDates = [].concat(...(calendarFramework?.dates || []));
  
        const parsedEvents: any[] = [];
  
        if (calIds.length === 0) {
          setGoogleCalendarEvents([]);
          return;
        }
  
        // @ts-expect-error
        const timeMaxDate = new Date(theDates[theDates.length - 1]?.date);
        const timeMax = new Date(
          timeMaxDate.setUTCHours(23, 59, 59, 999)
        ).toISOString();
  
        for (let i = 0; i < calIds.length; i++) {
          // @ts-expect-error
          const eventList = await gapi?.client?.calendar?.events?.list({
            calendarId: calIds[i],
            // @ts-expect-error
            timeMin: theDates[0]?.date?.toISOString(),
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
          });
  
          const theEvents = eventList?.result?.items || [];
  
          for (let event of theEvents) {
            const startDate = new Date(event?.start?.dateTime || event?.start?.date);
            const endDate = new Date(event?.end?.dateTime || event?.end?.date);
  
            if (startDate.getDay() !== endDate.getDay()) {
              continue; // Skip events that span multiple days
            }
  
            parsedEvents.push(event);
          }
        }
  
        setGoogleCalendarEvents([...googleCalendarEvents, ...parsedEvents]);
  
        // Now, fill availability not in GCal events
        if (shouldFillAvailability)
          fillAvailabilityNotInGCalEvents(parsedEvents, theDates);
  
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      }
    };
  
    if (gapi) {
      getGoogleCalData(googleCalIds);
    } else {
      return;
    }
  }, [gapi, googleCalIds]);

  const fetchUserCals = async () => {
    return await new Promise((resolve, reject) => {
      // @ts-expect-error
      gapi?.client?.calendar?.calendarList
        .list()
        // @ts-expect-error
        .then((response) => {
          const calendars = response.result.items;
          resolve(calendars);
        })
        // @ts-expect-error
        .catch((error) => {
          reject(error);
        });
    });
  };

  const onPopupCloseAndSubmit = () => {
    // @ts-expect-error
    setGoogleCalIds(selectedPopupIds);
    setGcalPopupOpen(false);
  };

  const handleSelectAllAndFillAvailability = () => {
    // Select all Google Calendar IDs
    const allCalIds = googleCalendars.map((cal) => cal.id);
    setGoogleCalIds(allCalIds);
    console.log('hi');
    setShouldFillAvailability(true);
    setIsFillingAvailability(true);
  };

  const fillAvailabilityNotInGCalEvents = (
    parsedEvents: any[],
    dates: calandarDate[]
  ) => {
    const userIndex = getCurrentUserIndex();
    const oldCalendarState = {...calendarState};
    const userAvailability = oldCalendarState[userIndex];

    // @ts-expect-error
    const startHour = calendarFramework.startTime.getHours();
     // @ts-expect-error
    const startMinute = calendarFramework.startTime.getMinutes();
  
     // @ts-expect-error
    const endHour = calendarFramework.endTime.getHours();
     // @ts-expect-error
    const endMinute = calendarFramework.endTime.getMinutes();
  
    const totalMinutes =
      (endHour - startHour) * 60 + (endMinute - startMinute);
    const totalBlocks = totalMinutes / 15; // Assuming 15-minute intervals
  
    const timeBlocks = generateTimeBlocks(
       // @ts-expect-error
      calendarFramework.startTime,
       // @ts-expect-error
      calendarFramework.endTime
    );
    const times: string[] = ([] as string[]).concat(...timeBlocks);
  
    for (let columnID = 0; columnID < dates.length; columnID++) {
      const dateObj = dates[columnID];
      for (let blockID = 0; blockID < totalBlocks; blockID++) {
        const timeString = times[blockID];
        const [hours, minutes] = timeString.split(':').map(Number);
  
        // @ts-expect-error
        const startDateTime = new Date(dateObj.date);
        startDateTime.setHours(hours, minutes, 0, 0);
  
        const endDateTime = new Date(startDateTime.getTime() + 15 * 60 * 1000);
  
        const overlapsGCalEvent = parsedEvents.some((event) => {
          const eventStart = new Date(
            event.start.dateTime || event.start.date
          );
          const eventEnd = new Date(event.end.dateTime || event.end.date);
  
          return startDateTime < eventEnd && endDateTime > eventStart;
        });
  
        if (!overlapsGCalEvent) {
          userAvailability[columnID][blockID] = true;
        }
      }
    }
  
    oldCalendarState[userIndex] = userAvailability;
     // @ts-expect-error
    setCalendarState(oldCalendarState);
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
          // @ts-expect-error
          setSelectedDateTimeObjects(getChosenDayAndTime());

          let avail: Availability | undefined =
            getAccountId() === ''
              ? getAvailabilityByAccountId(getAccountId())
              : getAvailabilityByName(accountName);

          if (avail === undefined) {
            avail = eventAPI.getEmptyAvailability(dim);
          }

          setChartedUsers(participants);

          setEventName(getEventName());
          setEventDescription(getEventDescription());
          setLocationOptions(getLocationOptions());

          const theRange = getChosenDayAndTime();
          //@ts-expect-error
          setSelectedDateTimeObjects(theRange);
          setCalendarState([...availabilities, avail]);
          setCalendarFramework(dim);

          /* The first date having a year be 2000 means that it was a general days selection */
          setAreSelectingGeneralDays(
            dim?.dates[0][0].date?.getFullYear() == 2000 &&
              theRange === undefined
          );

          // if there's a selection already made, nav to groupview since you're not allowed to edit ur avail
          if (
            theRange != undefined &&
            // @ts-expect-error
            theRange?.length !== 0 &&
            theRange[0].getFullYear() != 1970
          ) {
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
      // @ts-expect-error
      const response = await gapi?.client?.calendar?.calendarList.list();
      const calendars = response.result.items;
      setGoogleCalendars(calendars);
      setGcalPopupOpen(true);
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
    // @ts-expect-error
    const avail = calendarState[user];
    wrappedSaveParticipantDetails(avail, selectedLocations);
    navigate(`/groupview/${code}`);
  };

  const handleSubmitAvailability = () => {
    saveAvailAndLocationChanges();
  };

  return (
    <div className="bg-sky-100 w-full px-4 md:px-8 lg:px-12">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between align-center justify-center items-center">
        {/* Event details and location selection */}
        <div className="w-[90%] md:w-full md:ml-[5%] md:mr-[2%] md:mt-[5%] md:w-[45%] mb-8 md:mb-0">
          <div className="mb-4">
            <h3 className="text-sm text-gray-400 mb-0">Event Name</h3>
            <h3 className="text-2xl font-bold break-words mt-0">{eventName}</h3>
          </div>

          {eventDescription && (
            <div className="mb-10">
              <h3 className="text-sm text-gray-400 mb-0">Description</h3>
              <h3 className="text-xl font-bold break-words mt-0">
                {eventDescription}
              </h3>
            </div>
          )}

          {selectedDateTimeObjects == undefined &&
            locationOptions.length > 0 && (
              <div className="mb-8">
                <LocationSelectionComponent
                  update={updateSelectedLocations}
                  locations={locationOptions}
                />
              </div>
            )}

          <div className="hidden md:flex md:mt-12 flex flex-col items-center">
            <ButtonSmall
              bgColor="blue-500"
              textColor="white"
              onClick={handleSubmitAvailability}
            >
              Submit Availability
            </ButtonSmall>
            {selectedDateTimeObjects !== undefined &&
              (selectedDateTimeObjects[0] as Date).getFullYear() != 1970 && (
                <InformationPopup
                  content="Note: You can't edit your availability because the admin has
                already selected a time and/or location!"
                />
              )}
          </div>
          <div className="mt-6 md:hidden md:mt-12 flex flex-col items-center">
            <ButtonSmall
              bgColor="blue-500"
              textColor="white"
              onClick={handleSubmitAvailability}
            >
              Submit Availability
            </ButtonSmall>
            {selectedDateTimeObjects !== undefined &&
              (selectedDateTimeObjects[0] as Date).getFullYear() != 1970 && (
                <InformationPopup
                  content="Note: You can't edit your availability because the admin has
                already selected a time and/or location!"
                />
              )}
          </div>
        </div>

        {/* Calendar section */}
        <div
          className={`w-[95%] mb-4 md:w-[45%] right-column ${selectedDateTimeObjects !== undefined && (selectedDateTimeObjects[0] as Date).getFullYear() != 1970 ? 'opacity-60' : ''}`}
        >
          <div className="overflow-x-auto md:overflow-x-visible">
            <Calendar
              title={'Enter Your Availability'}
              // @ts-expect-error
              theCalendarState={[calendarState, setCalendarState]}
              user={getCurrentUserIndex()}
              // @ts-expect-error
              theCalendarFramework={[calendarFramework, setCalendarFramework]}
              draggable={true}
              chartedUsersData={undefined}
              theSelectedDate={[
                //@ts-expect-error
                selectedDateTimeObjects,
                //@ts-expect-error
                setSelectedDateTimeObjects,
              ]}
              // @ts-expect-error
              theDragState={[dragState, setDragState]}
              isAdmin={false}
              theGoogleCalendarEvents={[
                //@ts-expect-error
                googleCalendarEvents,
                //@ts-expect-error
                setGoogleCalendarEvents,
              ]}
            />
          </div>

          {!areSelectingGeneralDays && getAccountId() !== '' ? (
            <div className="md:pl-4 z-60 mb-4 md:mb-0">
              <div className="hidden md:flex">
                <ButtonSmall
                  bgColor="blue-500"
                  textColor="white"
                  onClick={handleToggleGCalAvailabilitiesClick}
                >
                  Show GCal Events
                </ButtonSmall>
              </div>
              <div className="md:hidden flex">
                <ButtonSmall
                  bgColor="blue-500"
                  textColor="white"
                  onClick={handleToggleGCalAvailabilitiesClick}
                  //   fetchUserCals()
                  //     .then((calendars) => {
                  //       // @ts-expect-error
                  //       setGoogleCalendars(calendars);

                  //       setGcalPopupOpen(true);
                  //     })
                  //     .catch((error) => {
                  //       console.error(
                  //         'Error fetching Google Calendars:',
                  //         error
                  //       );
                  //     });
                  // }}
                >
                  Show GCal Events
                </ButtonSmall>
              </div>
            </div>
          ) : (
            !areSelectingGeneralDays && (
              <div className="md:pl-4 mb-4 md:mb-0">
                <button
                  className="w-full md:w-auto font-bold rounded-full shadow-md bg-white text-gray-600 py-3 px-4 text-sm md:text-base
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
                  <img src={LOGO} alt="Logo" className="mr-2 h-5 md:h-6" />
                  Sign in with Google to access GCal
                </button>
              </div>
            )
          )}
        </div>
      </div>
      <Popup
        isOpen={isGcalPopupOpen}
        onClose={closeGcalPopup}
        onCloseAndSubmit={onPopupCloseAndSubmit}
        onSelectAllAndFill={handleSelectAllAndFillAvailability}
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
                    // If the ID is already in the array, remove it
                    return prevState.filter((id) => id !== cal.id);
                  } else {
                    // If the ID is not in the array, add it
                    return [...(prevState || []), cal.id];
                  }
                });
              }}
            />
          ))}
        </FormGroup>
      </Popup>
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

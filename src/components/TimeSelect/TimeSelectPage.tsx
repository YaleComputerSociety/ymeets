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
  getTimezone,
  updateAnonymousUserToAuthUser,
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
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { getUserTimezone } from '../utils/functions/timzoneConversions';

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
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(
    getAccountId() !== ''
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

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

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
  const [isGeneralDays, setIsGeneralDays] = useState(
    calendarFramework?.dates?.[0]?.[0]?.date?.getFullYear() === 2000
  );
  useEffect(() => {
    const fetchData = async () => {
      if (code && code.length === 6) {
        await getEventOnPageload(code)
          .then(() => {
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
            setIsGeneralDays(
              dim?.dates[0][0].date?.getFullYear() === 2000 &&
                theRange === undefined
            );

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
          })
          .catch(() => {
            nav('/notfound');
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

      // Calculate time range based on whether it's general days or not
      // if general days -- the events for the next day are grabbed. So if SUN is one of them,
      // the events for the next SUN are grabbed

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
        const eventList = await gapi?.client?.calendar?.events?.list({
          calendarId: calIds[i],
          timeMin,
          timeMax,
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
  }, [gapi, googleCalIds, isGeneralDays]);

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

    const times: string[] = ([] as string[]).concat(...timeBlocks.flat());

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

  const checkIfUserHasCalendarScope = async (): Promise<boolean> => {
    const currentScopes =
      gapi?.auth2?.getAuthInstance()?.currentUser?.get()?.getGrantedScopes() ||
      '';
    return currentScopes.includes(
      'https://www.googleapis.com/auth/calendar.readonly'
    );
  };

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

  const handleAutofillAvailabilityClick = async () => {
    setShouldFillAvailability(true);
    setIsFillingAvailability(true);

    // Proceed with autofill even if no GCals are selected
    await getGoogleCalData(googleCalIds.length > 0 ? googleCalIds : [], true);
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
    <div className="w-full px-0 lg:px-12 mb-5 lg:mb-0">
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
                update={setSelectedLocations}
              />
            </div>
          )}
          <CopyCodeButton />
        </div>
        <div className="lg:col-span-3">
          <div className="w-full">
            <div className="flex flex-col space-y-0 mb-2">
              <div className="flex justify-center ml-2 mr-2 md:justify-start md:ml-5 md:mr-5 md:mt-5 mb-2">
                {/* Mobile layout */}
                <div className="w-full flex flex-col gap-4 md:hidden">
                  {isGoogleLoggedIn ? (
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
                      onClick={() => {
                        signInWithGoogle(
                          undefined,
                          undefined,
                          handleIsSignedIn
                        ).then((loginSuccessful) => {
                          if (loginSuccessful) {
                            updateAnonymousUserToAuthUser(getAccountName());
                            setIsGoogleLoggedIn(true);
                          }
                        });
                      }}
                    >
                      <img src={LOGO} alt="Logo" className="mr-2 h-5" />
                      Sign in to access GCal
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
                <div className="hidden md:flex items-center w-full max-w-full justify-between items-center space-x-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      {isGoogleLoggedIn ? (
                        <>
                          <ButtonSmall
                            bgColor="primary"
                            textColor="white"
                            themeGradient={false}
                            onClick={handleToggleGCalAvailabilitiesClick}
                            className="!rounded-lg"
                          >
                            Show GCal Events
                          </ButtonSmall>
                          <ButtonSmall
                            bgColor="primary"
                            textColor="white"
                            themeGradient={false}
                            onClick={handleAutofillAvailabilityClick}
                            className="!rounded-lg"
                          >
                            Autofill Availability
                          </ButtonSmall>
                        </>
                      ) : (
                        <button
                          className="font-bold rounded-full shadow-md bg-white text-gray-600 py-3 px-4 text-sm
                          flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                          onClick={() => {
                            signInWithGoogle(
                              undefined,
                              undefined,
                              handleIsSignedIn
                            ).then((loginSuccessful) => {
                              if (loginSuccessful) {
                                updateAnonymousUserToAuthUser(getAccountName());
                                setIsGoogleLoggedIn(true);
                              }
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
          code={code || ''}
        />
      )}
    </div>
  );
}

export default TimeSelectPage;

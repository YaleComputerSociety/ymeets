import React from 'react';
import { useState, useEffect } from 'react';
import { calanderState, userData, calendarDimensions } from '../../types';
import eventAPI from '../../firebase/eventAPI';
import TimeSelectComponent from '../DaySelect/time_select_component';
import { FaRegEdit } from 'react-icons/fa';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateObject } from 'react-multi-date-picker';
import { Calendar } from 'react-multi-date-picker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Calender from '../selectCalendarComponents/CalendarApp';
import dayjs from 'dayjs';
import Select from 'react-dropdown-select';
import {
  getEventOnPageload,
  getEventName,
  getParticipantIndex,
  getAccountId,
  getEventDescription,
  getLocationsVotes,
  getLocationOptions,
  setChosenLocation,
  getChosenDayAndTime,
  getAccountName,
  setChosenDate,
  getChosenLocation,
  getZoomLink,
  setNewEventDescription,
  getDates,
  getStartAndEndTimes,
  undoAdminSelections,
  setNewStartTimes,
  setNewEndTimes,
  setNewDates,
} from '../../firebase/events';
import { setNewEventName } from '../../firebase/events';
import { useParams, useNavigate } from 'react-router-dom';
import LocationChart from './LocationChart';
import UserChart from './UserChart';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import GeneralPopup from '../DaySelect/general_popup_component';
import AddToGoogleCalendarButton from './AddToCalendarButton';
import copy from 'clipboard-copy';
import { IconCopy } from '@tabler/icons-react';
import Button from '../utils/components/Button';
import { Popup } from '../utils/components/Popup';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import InformationPopup from '../utils/components/InformationPopup';
import { Input } from '../utils/components/Input';

/**
 * Group View (with all the availabilities) if you are logged in as the creator of the Event.
 * @returns Page Component
 */
export default function AdminGroupViewPage() {
  const [calendarState, setCalendarState] = useState<calanderState | undefined>(
    undefined
  );
  const [calendarFramework, setCalendarFramework] = useState<
    calendarDimensions | undefined
  >(undefined);
  const { code } = useParams();

  const [chartedUsers, setChartedUsers] = useState<userData | undefined>(
    undefined
  );
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [locationVotes, setLocationVotes] = useState(Object);
  const [locationOptions, setLocationOptions] = useState(Array<string>);

  // this is the location that admin selected on the CLIENT side
  const [adminChosenLocation, setAdminChosenLocation] = useState<
    string | undefined
  >(undefined);

  // this is the location the admin previously submitted / submitted to the backend, which is pulled and set
  // or updated to be the admin location
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  );
  const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<
    Date[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [showGeneralPopup, setShowGeneralPopup] = useState(false);
  const [generalPopupMessage] = useState('');

  const [dragState, setDragState] = useState({
    dragStartedOnID: [], // [columnID, blockID]
    dragEndedOnID: [],
    dragStartedOn: false,
    affectedBlocks: new Set(),
  });

  const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
      const mediaQueryList = window.matchMedia(query);
      const handleChange = () => setMatches(mediaQueryList.matches);

      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
  };
  const isMedScreen = useMediaQuery('(min-width: 768px)');
  const [dates, setDates] = useState<Date[][]>(() => {
    const datesArray = getDates();
    return datesArray.map((date) => [date]);
  });
  const handleChange = (selectedDates: DateObject[][]) => {
    const duplicatesArray = Array.from(
      selectedDates.flat().map((d) => new Date(d.format()))
    );

    let uniqueArray = duplicatesArray
      .map(function (date) {
        return date.getTime();
      })
      .filter(function (date, i, array) {
        return array.indexOf(date) === i;
      })
      .map(function (time) {
        return new Date(time);
      });

    console.log(uniqueArray);
    setDates(uniqueArray.map((d) => [d]));
  };

  const [copied, setCopied] = useState(false);

  const [selectionConfirmedPopupOpen, setSelectionConfirmedPopupOpen] =
    useState(false);

  const [areWeEditing, setAreWeEditing] = useState(false);
  const [newEventDetails, setNewEventDetails] = useState({
    eventName: undefined,
    eventDescription: undefined,
    startTime: undefined,
    endTime: undefined,
    newDates: undefined,
  });

  // const [adminHasSelected, setAdminAsSelected] = useState(
  //   !selectedDateTimeObjects || selectedDateTimeObjects[0].getFullYear() == 1970
  // )

  const nav = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (code && code.length == 6) {
        await getEventOnPageload(code)
          .then(() => {
            const { availabilities, participants } = eventAPI.getCalendar();
            const dates = eventAPI.getCalendarDimensions();

            setChartedUsers(participants);
            setCalendarState(availabilities);
            setCalendarFramework(dates);

            setEventName(getEventName());
            setEventDescription(getEventDescription());
            setLocationVotes(getLocationsVotes());
            setLocationOptions(getLocationOptions());
            setSelectedLocation(getChosenLocation());
            setLoading(false);
            // @ts-expect-error
            setSelectedDateTimeObjects(getChosenDayAndTime());
          })
          .catch(() => {
            nav('/notfound');
          });
      } else {
        // url is malformed
        nav('notfound');
      }
    };
    fetchData();
  }, []);

  function handleSelectionSubmission() {
    if (dragState.dragEndedOnID.length == 0) {
      alert('No new time selection made!');
      return;
    }

    if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
      alert('You must select times that occur on the same day!');
      return;
    }

    // @ts-expect-error
    const calDate = [].concat(...calendarFramework.dates)[
      dragState.dragStartedOnID[0]
    ];
    const timeBlocks = generateTimeBlocks(
      calendarFramework?.startTime,
      calendarFramework?.endTime
    );
    // @ts-expect-error
    const times = [].concat(...timeBlocks);

    if (
      dragState.dragStartedOnID.length > 0 &&
      dragState.dragEndedOnID.length > 0
    ) {
      const selectedStartTimeHHMM = times[dragState.dragStartedOnID[1]];
      const selectedEndTimeHHMM = times[dragState.dragEndedOnID[1]];
      const [startHour, startMinute] = selectedStartTimeHHMM
        //@ts-ignore
        .split(':')
        .map(Number);
      // @ts-expect-error
      let [endHour, endMinute] = selectedEndTimeHHMM.split(':').map(Number);

      // @ts-expect-error
      const selectedStartTimeDateObject = new Date(calDate.date);
      selectedStartTimeDateObject.setHours(startHour);
      selectedStartTimeDateObject.setMinutes(startMinute);

      // @ts-expect-error
      const selectedEndTimeDateObject = new Date(calDate.date);

      endMinute += 15;
      if (endMinute == 60) {
        endMinute = 0;
        endHour += 1;
        if (endHour == 25) {
          endHour = 0;
        }
      }

      selectedEndTimeDateObject.setHours(endHour);
      selectedEndTimeDateObject.setMinutes(endMinute);

      // update on client side (set SelectedDateTimeObjects) + backend (setChosenDate)
      setSelectedDateTimeObjects([
        selectedStartTimeDateObject,
        selectedEndTimeDateObject,
      ]);

      setChosenDate(
        selectedStartTimeDateObject,
        selectedEndTimeDateObject
      ).then(() => {
        setSelectedLocation(adminChosenLocation);

        if (adminChosenLocation != undefined) {
          setChosenLocation(adminChosenLocation);
        }

        setSelectionConfirmedPopupOpen(false);
      });
    }
  }

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      // new user => last availability
      user =
        calendarState !== undefined ? Object.keys(calendarState).length - 1 : 0;
    }
    return user;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingAnim />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mx-4 mb-4 md:mx-10 md:mb-10">
        <div className="flex flex-col-reverse justify-center w-[100%] md:px-8 md:flex-row md:space-x-7 lg:space-x-15 xl:space-x-25">
          {showGeneralPopup && (
            <GeneralPopup
              onClose={() => {
                setShowGeneralPopup(false);
              }}
              message={generalPopupMessage}
              isLogin={false}
            />
          )}
          <div className="flex flex-col flex-none md:w-[48%] mb-4 md:mt-0 space-y-5 items-center">
            <div className="w-[100%] content-start align-start items-start">
              {/* Edit availability button */}

              <div className="flex flex-row">
                <div className="flex-grow">
                  <div className="hidden md:block flex flex-row ml-0 md:ml-4">
                    <Button
                      bgColor="blue-500"
                      textColor="white"
                      disabled={
                        selectedDateTimeObjects &&
                        selectedDateTimeObjects[0].getFullYear() != 1970
                      }
                      onClick={() => {
                        nav('/timeselect/' + code);
                      }}
                      rounded="lg"
                      textSize="sm"
                      px="4"
                      py="2"
                    >
                      <span className="mr-1">&#8592;</span> Edit Your
                      Availiability
                    </Button>
                    <Button
                      bgColor="gray-500"
                      textColor="white"
                      disabled={false}
                      onClick={() => setAreWeEditing(true)}
                      rounded="lg"
                      textSize="md"
                    >
                      Edit Event Details
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col content-center space-y-1 md:w-[75%] flex-none mb-5 md:mt-0">
                {/* Event name, location, and time */}

                <div className="hidden mb-4 flex flex-col space-y-5 md:block">
                  <h3 className="text-3xl font-bold text-center md:text-left">
                    {eventName}
                  </h3>
                  <h3 className="text-xl  text-center md:text-left">
                    {eventDescription}
                  </h3>

                  <div className="flex flex-col">
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Time:</span>{' '}
                      {selectedDateTimeObjects &&
                      selectedDateTimeObjects[0].getFullYear() != 1970
                        ? selectedDateTimeObjects[0]?.toLocaleDateString(
                            'en-us',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          ) +
                          ' — ' +
                          selectedDateTimeObjects[1]?.toLocaleTimeString(
                            'en-us',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          )
                        : 'not selected'}
                    </h3>
                    {locationOptions.length > 0 && (
                      <h3 className="text-base text-center md:text-left">
                        <span className="font-bold">Location:</span>{' '}
                        {selectedLocation !== undefined
                          ? selectedLocation
                          : 'not selected'}
                      </h3>
                    )}
                    {getZoomLink() && (
                      <h3 className="text-base text-center md:text-left">
                        <span className="font-bold">Zoom Link:</span>{' '}
                        {getZoomLink()}
                      </h3>
                    )}
                    <button
                      onClick={() => {
                        copy(`${window.location.origin}/timeselect/${code}`);
                        setCopied(true);
                        setTimeout(() => {
                          setCopied(false);
                        }, 1000);
                      }}
                      className={`text-sm mt-4 lg:text-base flex items-center gap-2 justify-center ${
                        copied ? 'bg-green-700' : 'bg-slate-100'
                      } ${
                        copied ? 'hover:text-slate-700' : 'hover:text-slate-700'
                      }  border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg ${
                        copied ? 'hover:bg-green-700' : 'hover:bg-slate-200'
                      }  
            
                          transition-colors relative`}
                    >
                      {!copied && (
                        <IconCopy className="inline-block w-4 lg:w-5" />
                      )}
                      {copied ? 'Copied' : 'Shareable Link'}
                    </button>
                    {selectedLocation && (
                      <Button
                        textColor="white"
                        bgColor="blue-500"
                        onClick={() => {
                          window.open(
                            'https://25live.collegenet.com/pro/yale#!/home/event/form',
                            '_blank'
                          );
                        }}
                      >
                        Book Room
                      </Button>
                    )}
                  </div>
                </div>

                {/* <div className="flex flex-row space-x-2">
                {selectedDateTimeObjects ? (
                  <div className="w-full">
                    <AddToGoogleCalendarButton />
                  </div>
                ) : undefined}
              </div> */}

                {/* User availability table */}
                <div className="mb-2">
                  {chartedUsers !== undefined && (
                    <UserChart
                      // @ts-expect-error
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                    />
                  )}
                </div>

                {/* Location options table */}

                {locationOptions.length > 0 && (
                  <LocationChart
                    theSelectedLocation={[
                      //@ts-expect-error
                      adminChosenLocation,
                      //@ts-expect-error
                      setAdminChosenLocation,
                    ]}
                    locationOptions={
                      locationOptions.length > 0 ? locationOptions : ['']
                    }
                    locationVotes={Object.values(locationVotes)}
                  />
                )}
              </div>
            </div>
            <div className="max-w-[100%] lg:max-w-[50%] ">
              <div className="flex flex-col content-center grow overflow-x-auto md:content-end">
                <Calender
                  title={''}
                  //@ts-expect-error
                  theCalendarState={[calendarState, setCalendarState]}
                  theCalendarFramework={[
                    //@ts-expect-error
                    calendarFramework,
                    //@ts-expect-error
                    setCalendarFramework,
                  ]}
                  //@ts-expect-error
                  chartedUsersData={[chartedUsers, setChartedUsers]}
                  draggable={true}
                  user={getCurrentUserIndex()}
                  isAdmin={true}
                  theSelectedDate={[
                    //@ts-expect-error
                    selectedDateTimeObjects,
                    //@ts-expect-error
                    setSelectedDateTimeObjects,
                  ]}
                  //@ts-expect-error
                  theDragState={[dragState, setDragState]}
                  //@ts-expect-error
                  theGoogleCalendarEvents={[undefined, undefined]}
                />
              </div>

              <div className="md:pl-3">
                {!selectedDateTimeObjects ||
                  (selectedDateTimeObjects[0].getFullYear() != 1970 && (
                    <div className="p-1 flex-shrink w-[80%] text-gray-500 text-left text-sm md:text-left">
                      {/* NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. <br/>  */}
                      {locationOptions.length == 0 ? (
                        <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press submit selection" />
                      ) : (
                        <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press submit selection." />
                      )}
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-center">
                {!selectedDateTimeObjects ||
                selectedDateTimeObjects[0].getFullYear() == 1970 ? (
                  <button
                    onClick={() => {
                      setSelectionConfirmedPopupOpen(true);
                    }}
                    className="font-bold rounded-full bg-blue-500 text-white py-3 px-5 text-sm mb-8 w-fit
                                        transform transition-transform hover:scale-90 active:scale-100e"
                  >
                    Submit Selection
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      undoAdminSelections().then(() => {
                        window.location.reload();
                      });
                    }}
                    className="font-bold rounded-full bg-blue-500 text-white py-3 px-5 text-sm mb-8 w-fit
                                    transform transition-transform hover:scale-90 active:scale-100e"
                  >
                    Undo Selection
                  </button>
                )}
              </div>
              <div className="flex justify-center items-center mt-2">
                {selectedDateTimeObjects ? (
                  <div className="flex justify-center items-center px-4">
                    <AddToGoogleCalendarButton />
                  </div>
                ) : undefined}
              </div>
            </div>
            <Popup
              onCloseAndSubmit={handleSelectionSubmission}
              onClose={() => {
                setSelectionConfirmedPopupOpen(false);
              }}
              isOpen={selectionConfirmedPopupOpen}
            >
              <div
                className="text-xl"
                style={{
                  maxWidth: isMedScreen ? '50vw' : '75vw',
                  margin: 'auto',
                }}
              >
                <br></br>
                <span className="font-bold">Warning: </span> Submitting this
                selection will lock all other participants from being able to
                edit their availability. You cannot undo this action.
              </div>
            </Popup>

            <div className="md:hidden flex flex-col flex-none mb-5 items-center">
              {/* (Mobile): Event name, location, and time */}
              <div className="w-[100%] content-start align-start items-start">
                <div className="flex flex-row ml-0 md:ml-4">
                  <div className="flex-grow ml-2">
                    <button
                      className="font-bold text-white bg-blue-500 rounded-full bg-blue-500 text-white py-2 px-4 text-sm w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
                      disabled={
                        selectedDateTimeObjects != undefined &&
                        selectedDateTimeObjects[0].getFullYear() != 1970
                      }
                      onClick={() => {
                        nav('/timeselect/' + code);
                      }}
                    >
                      <span className="mr-1">&#8592;</span> Edit Your
                      Availiability
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col content-center space-y-1 w-[80%] flex-none mb-5 md:mt-0">
                <div className="mb-4 flex flex-col space-y-2 mt-4">
                  <h3 className="text-2xl font-bold text-center mb-0">
                    {eventName}
                  </h3>
                  <h3 className="text-md text-left mt-0">{eventDescription}</h3>

                  <div className="flex flex-col">
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Time:</span>{' '}
                      {selectedDateTimeObjects &&
                      (selectedDateTimeObjects[0] as Date).getFullYear() != 1970
                        ? selectedDateTimeObjects[0]?.toLocaleDateString(
                            'en-us',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'not selected'}
                    </h3>

                    {locationOptions.length > 0 && (
                      <h3 className="text-base text-center md:text-left">
                        <span className="font-bold">Location:</span>{' '}
                        {selectedLocation !== undefined
                          ? selectedLocation
                          : 'not selected'}
                      </h3>
                    )}
                    {getZoomLink() && (
                      <h3 className="text-base text-center md:text-left">
                        <span className="font-bold">Zoom Link:</span>{' '}
                        <a
                          href={getZoomLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-left w-full md:w-auto break-all text-blue-500 underline"
                        >
                          {getZoomLink()}
                        </a>
                      </h3>
                    )}
                    <div className="flex justify-center">
                      {selectedLocation && (
                        <button
                          onClick={() => {
                            window.open(
                              'https://25live.collegenet.com/pro/yale#!/home/event/form',
                              '_blank'
                            );
                          }}
                          className="font-bold mt-2 items-center justify-center rounded-md bg-blue-500 text-white text-base w-fit p-3 transform transition-transform hover:scale-90 active:scale-100e"
                        >
                          Book Room
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        copy(`${window.location.origin}/timeselect/${code}`);
                        setCopied(true);
                        setTimeout(() => {
                          setCopied(false);
                        }, 1500);
                      }}
                      className={`text-sm mt-4 lg:text-base flex items-center gap-2 justify-center ${
                        copied
                          ? 'bg-green-500 hover:bg-green-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      } border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg transition-colors relative`}
                    >
                      {<IconCopy className="inline-block w-4 lg:w-5" />}
                      {copied ? 'Copied' : 'Shareable ymeets Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Popup
              onClose={() => {
                setAreWeEditing(false);
              }}
              onCloseAndSubmit={() => {
                setNewEventName(newEventDetails.eventName).then(() => {
                  setNewEventDescription(newEventDetails.eventDescription).then(
                    () => {
                      setNewStartTimes(newEventDetails.startTime).then(() => {
                        setNewEndTimes(newEventDetails.endTime).then(() => {
                          setNewDates(dates.flat()).then(() => {
                            setAreWeEditing(false);
                            window.location.reload();
                          });
                        });
                      });
                    }
                  );
                });
              }}
              isOpen={areWeEditing}
            >
              <div className="flex flex-col gap-4 justify-center items-center">
                <h1 className="text-lg font-bold">Event Name</h1>
                <Input
                  className="w-full"
                  value={newEventDetails.eventName || ''}
                  placeholder={eventName}
                  onChange={(e) => {
                    //@ts-expect-error
                    setNewEventDetails((prev) => ({
                      ...prev,
                      eventName: e.target.value,
                    }));
                  }}
                />
                <h1 className="text-lg font-bold">Event Description</h1>
                <Input
                  className="w-full"
                  value={newEventDetails.eventDescription || ''}
                  placeholder={eventDescription}
                  onChange={(e) => {
                    //@ts-expect-error
                    setNewEventDetails((prev) => ({
                      ...prev,
                      eventDescription: e.target.value,
                    }));
                  }}
                />
                <h1 className="text-lg font-bold">Selected Times</h1>
                <div className="flex flex-row gap-2">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={dayjs(getStartAndEndTimes()[0])}
                      label={'Start Time'}
                      className="w-full"
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={dayjs(getStartAndEndTimes()[1])}
                      label={'End Time'}
                      className="w-full"
                    />
                  </LocalizationProvider>
                </div>
                <h1 className="text-lg font-bold">Selected Dates</h1>
                <Calendar
                  className="w-full"
                  multiple
                  value={dates}
                  onChange={handleChange}
                  range
                  numberOfMonths={2}
                />
                {/* <Select
                style={{ height: '100%', zIndex: 1000, width: '100%' }} // Apply 100% width to match container
                multi
                create={false}
                options={options}
                clearOnSelect={false}
                values={[]}
                onChange={(values: any) => {
                  props.update(values.map((val: any) => val.value))
                }}
                dropdownPosition="auto"
                placeholder=" Select preferred location(s)"
                noDataRenderer={() => (
                  <div className="p-2 text-center">
                    No location options set :(
                  </div>
                )}
              /> */}
              </div>
              <InformationPopup content="Warning: Submitting Changes to the Selected Time and Dates will clear the availability for participants" />
            </Popup>
          </div>
        </div>
      </div>
    </>
  );
}

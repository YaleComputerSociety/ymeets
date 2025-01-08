import { useState, useEffect } from 'react';
import { checkIfAdmin } from '../../firebase/events';
import {
  calanderState,
  userData,
  calendarDimensions,
  dragProperties,
} from '../../types';
import eventAPI from '../../firebase/eventAPI';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { signInWithGoogle } from '../../firebase/auth';
import { useCallback } from 'react';
import {
  getEventOnPageload,
  getEventName,
  getEventObjectForGCal,
  getParticipantIndex,
  getAccountId,
  getEventDescription,
  getLocationsVotes,
  getLocationOptions,
  getAccountName,
  getChosenLocation,
} from '../../firebase/events';
import { useParams, useNavigate } from 'react-router-dom';
import LocationChart from './LocationChart';
import UserChart from './UserChart';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import GeneralPopup from '../DaySelect/general_popup_component';
import AddToGoogleCalendarButton from './AddToCalendarButton';
import copy from 'clipboard-copy';
import { IconCopy } from '@tabler/icons-react';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import InformationPopup from '../utils/components/InformationPopup';
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import { Switch, FormControlLabel } from '@mui/material';

interface GroupViewProps {
  isAdmin: boolean;
}
/**
 * Group View (with all the availabilities) if you are logged in as the creator of the Event.
 * @returns Page Component
 */
export default function AdminGroupViewPage({ isAdmin }: GroupViewProps) {
  const { gapi, handleIsSignedIn } = useContext(GAPIContext);

  const [calendarState, setCalendarState] = useState<calanderState>([]);
  const [calendarFramework, setCalendarFramework] =
    useState<calendarDimensions>({
      dates: [],
      startTime: new Date(),
      endTime: new Date(),
      numOfBlocks: 0,
      numOfCols: 0,
    });

  const { code } = useParams();

  const [showUserChart, setShowUserChart] = useState(false);

  const [chartedUsers, setChartedUsers] = useState<userData>({} as userData);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [locationVotes, setLocationVotes] = useState(Object);
  const [locationOptions, setLocationOptions] = useState(Array<string>);
  const [showLocationChart, setShowLocationChart] = useState(false);

  // this is the location that admin selected on the CLIENT side
  const [adminChosenLocation, setAdminChosenLocation] = useState<
    string | undefined
  >(undefined);

  // this is the location the admin previously submitted / submitted to the backend, which is pulled and set
  // or updated to be the admin location
  const [selectedLocation, setSelectedLocation] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [showGeneralPopup, setShowGeneralPopup] = useState(false);
  const [generalPopupMessage] = useState('');

  const [dragState, setDragState] = useState<dragProperties>({
    dragStartedOnID: [], // [columnID, blockID]
    dragEndedOnID: [],
    dragStartedOn: false,
    blocksAffectedDuringDrag: new Set(),
  });

  const [copied, setCopied] = useState(false);

  const nav = useNavigate();

  const createCalendarEventUrl = useCallback((event: any) => {
    const startDateTime = new Date(event.start.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
    const endDateTime = new Date(event.end.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    const baseUrl = 'https://calendar.google.com/calendar/render';
    const queryParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description,
      location: event.location,
      spropname: 'Add Event',
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }, []);

  const handleAddToCalendar = useCallback(
    async (startDate: Date, endDate: Date, location: string | undefined) => {
      const event = getEventObjectForGCal(startDate, endDate, location);
      const calendarEventUrl = createCalendarEventUrl(event);

      window.open(calendarEventUrl, '_blank');
    },
    [createCalendarEventUrl]
  );

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
            setAdminChosenLocation(getChosenLocation());
            setLoading(false);
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

  async function handleSelectionSubmission() {
    if (dragState.dragEndedOnID.length == 0) {
      alert('No new time selection made!');
      return;
    }

    if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
      alert('You must select times that occur on the same day!');
      return;
    }

    const calDate =
      calendarFramework?.dates.flat()[dragState.dragStartedOnID[0]];
    const timeBlocks = generateTimeBlocks(
      calendarFramework?.startTime,
      calendarFramework?.endTime
    );

    const times = timeBlocks.flat();

    if (
      dragState.dragStartedOnID.length > 0 &&
      dragState.dragEndedOnID.length > 0
    ) {
      const selectedStartTimeHHMM: string = times[dragState.dragStartedOnID[1]];
      const selectedEndTimeHHMM: string = times[dragState.dragEndedOnID[1]];

      const [startHour, startMinute] = selectedStartTimeHHMM
        .split(':')
        .map(Number);
      let [endHour, endMinute] = selectedEndTimeHHMM
        ? selectedEndTimeHHMM.split(':').map(Number)
        : [0, 0];

      const selectedStartTimeDateObject = new Date(calDate?.date!);
      selectedStartTimeDateObject.setHours(startHour);
      selectedStartTimeDateObject.setMinutes(startMinute);

      const selectedEndTimeDateObject = new Date(calDate?.date!);

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

      if (getAccountId() !== '') {
        await handleAddToCalendar(
          selectedStartTimeDateObject,
          selectedEndTimeDateObject,
          adminChosenLocation
        );
      } else {
        signInWithGoogle(undefined, gapi, handleIsSignedIn);
      }
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
      <div className="flex flex-col lg:flex-row justify-center mx-4 mb-4 lg:mx-10 lg:mb-10 ">
        <div className="lg:grid lg:grid-cols-4 lg:gap-11 w-full gap-y-3">
          <div className="col-span-1 mt-2 ml-0 lg:ml-9 w-full">
            {showGeneralPopup && (
              <GeneralPopup
                onClose={() => {
                  setShowGeneralPopup(false);
                }}
                message={generalPopupMessage}
                isLogin={false}
              />
            )}
            <div>
              <div className="flex flex-col content-center gap-4 mt-0">
                {/* Event name, location, and time */}
                <div className="m flex flex-col text-center space-y-3">
                  <div className="text-2xl lg:text-4xl font-bold lg:text-left">
                    {eventName}
                  </div>
                  <div className="text-lg lg:text-xl lg:text-left line-clamp-2 overflow-auto">
                    {eventDescription}
                  </div>
                  <button
                    onClick={() => {
                      copy(`${window.location.origin}/timeselect/${code}`);
                      setCopied(true);
                      setTimeout(() => {
                        setCopied(false);
                      }, 1500);
                    }}
                    className={`text-sm lg:text-base flex items-center justify-center ${
                      copied
                        ? 'bg-green-500 hover:bg-green-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    } border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg transition-colors relative`}
                  >
                    {<IconCopy className="inline-block w-4 lg:w-5 mr-2" />}
                    {copied ? 'Copied to Clipboard' : `Event Code: ${code}`}
                  </button>
                </div>

                {/* User availability and Location options tables */}
                <div className="hidden lg:block mb-2 space-y-2">
                  {/* Toggle button - only show if locationOptions exist */}
                  {locationOptions.length > 0 && (
                    <FormControlLabel
                      control={
                        <Switch
                          onClick={() => setShowLocationChart((prev) => !prev)}
                        />
                      }
                      label={`Show ${showLocationChart ? 'User Availability' : 'Locations'}`}
                    />
                  )}

                  {/* Charts */}
                  {chartedUsers !== undefined && !showLocationChart && (
                    <UserChart
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                    />
                  )}

                  {locationOptions.length > 0 && showLocationChart && (
                    <div className="relative w-full">
                      <LocationChart
                        theSelectedLocation={[
                          adminChosenLocation,
                          setAdminChosenLocation,
                        ]}
                        locationOptions={
                          locationOptions.length > 0 ? locationOptions : ['']
                        }
                        locationVotes={Object.values(locationVotes)}
                        selectionMade={
                          getChosenLocation() === ''
                            ? false
                            : getChosenLocation() === undefined
                              ? false
                              : true
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex flex-col overflow-x-auto w-full max-w-full">
              <Calendar
                theShowUserChart={[showUserChart, setShowUserChart]}
                onClick={() => {
                  setShowUserChart(true);
                  setTimeout(() => setShowUserChart(false), 3000);
                }}
                theCalendarState={[calendarState, setCalendarState]}
                theCalendarFramework={[calendarFramework, setCalendarFramework]}
                chartedUsersData={[chartedUsers, setChartedUsers]}
                draggable={
                  isAdmin &&
                  calendarFramework?.dates?.[0][0].date instanceof Date &&
                  (calendarFramework.dates[0][0].date as Date).getFullYear() !==
                    2000
                }
                user={getCurrentUserIndex()}
                isAdmin={isAdmin}
                theDragState={[dragState, setDragState]}
                theGoogleCalendarEvents={[[], () => {}]}
              />
              <div className="flex items-center justify-center lg:flex-row lg:justify-between lg:mr-3 lg:ml-3 gap-x-4">
                <button
                  className="font-bold rounded-full bg-primary text-white py-3 px-3 lg:py-3 lg:px-5 text-sm lg:text-md w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
                  onClick={() => {
                    nav('/timeselect/' + code);
                  }}
                >
                  <span className="mr-1">&#8592;</span> Edit Your Availability
                </button>

                {isAdmin &&
                  calendarFramework?.dates?.[0][0].date instanceof Date &&
                  (calendarFramework.dates[0][0].date as Date).getFullYear() !==
                    2000 && (
                    <AddToGoogleCalendarButton
                      onClick={handleSelectionSubmission}
                    />
                  )}
              </div>
            </div>

            <div className="lg:pl-3 mt-2">
              <div className="p-1 flex-shrink w-full lg:w-[80%] text-gray-500 text-left text-sm lg:text-left">
                {locationOptions.length === 0 ? (
                  <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press submit selection to GCAl" />
                ) : (
                  <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press submit selection." />
                )}
              </div>
            </div>
            {locationOptions.length > 0 && (
              <div className="lg:hidden">
                <LocationChart
                  theSelectedLocation={[
                    adminChosenLocation,
                    setAdminChosenLocation,
                  ]}
                  locationOptions={
                    locationOptions.length > 0 ? locationOptions : ['']
                  }
                  locationVotes={Object.values(locationVotes)}
                  selectionMade={
                    getChosenLocation() === ''
                      ? false
                      : getChosenLocation() === undefined
                        ? false
                        : true
                  }
                />
                {chartedUsers !== undefined && (
                  <div
                    className={`z-[9999] fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-in-out ${
                      showUserChart ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    <div className="bg-white p-4 z-[9999] rounded-t-xl shadow-lg">
                      <UserChart
                        chartedUsersData={[chartedUsers, setChartedUsers]}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

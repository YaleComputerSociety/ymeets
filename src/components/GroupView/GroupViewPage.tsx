import { useState, useEffect } from 'react';
import ButtonSmall from '../utils/components/ButtonSmall';
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

import { LoadingAnim } from '../utils/components/LoadingAnim';
import InformationPopup from '../utils/components/InformationPopup';
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import { connectFirestoreEmulator } from 'firebase/firestore';

interface GroupViewProps {
  isAdmin: boolean;
}
/**
 * Group View (with all the availabilities) if you are logged in as the creator of the Event.
 * @returns Page Component
 */
export default function GroupViewPage({ isAdmin }: GroupViewProps) {
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
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false, // true for selecting, false for deselecting
    lastPosition: null,
  });

  const nav = useNavigate();

  const createCalendarEventUrl = useCallback((event: any) => {
    const startDateTime = new Date(event.start.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
    const endDateTime = new Date(event.end.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    const baseUrl = 'https://calendar.google.com/calendar/render';
    const attendeesEmails = (event.attendees || [])
      .map((attendee: { email: string }) => attendee.email)
      .join(',');

    const queryParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description,
      location: event.location || '',
      spropname: 'Add Event',
      add: attendeesEmails,
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
    if (!dragState.endPoint || !dragState.startPoint) {
      alert('No new time selection made!');
      return;
    }

    const [startCol, startBlock] = dragState.startPoint;
    const [endCol, endBlock] = dragState.endPoint;

    if (startCol !== endCol) {
      alert('You must select times that occur on the same day!');
      return;
    }

    const calDate = calendarFramework?.dates.flat()[startCol];
    const timeBlocks = generateTimeBlocks(
      calendarFramework?.startTime,
      calendarFramework?.endTime
    );

    const times = timeBlocks.flat();

    const selectedStartTimeHHMM: string = times[startBlock];
    const selectedEndTimeHHMM: string = times[endBlock];

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
    <div className="w-full px-0 lg:px-8 lg:px-12 mb-5 lg:mb-0">
      <div className="lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col">
        <div className="text-text dark:text-text-dark lg:p-0 p-4 lg:ml-5 lg:mt-5 col-span-1 gap-y-3 flex flex-col lg:items-start lg:justify-start items-center justify-center mb-3">
          <div className="text-4xl font-bold text-center lg:text-left" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {eventName}
          </div>
          <div className="text-xl text-center lg:text-left" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {eventDescription}
          </div>

          <CopyCodeButton />

          {locationOptions.length > 0 && (
            <div className="hidden lg:block">
              <FormControlLabel
                control={
                  <Switch
                    onClick={() => setShowLocationChart((prev) => !prev)}
                  />
                }
                label={`Show ${showLocationChart ? 'User Availability' : 'Locations'}`}
              />
            </div>
          )}

          <div className="hidden lg:block w-full">
            {chartedUsers !== undefined && !showLocationChart && (
              <UserChart chartedUsersData={[chartedUsers, setChartedUsers]} />
            )}

            {locationOptions.length > 0 && showLocationChart && (
              <LocationChart
                theSelectedLocation={[
                  adminChosenLocation,
                  setAdminChosenLocation,
                ]}
                locationOptions={
                  locationOptions.length > 0 ? locationOptions : ['']
                }
                locationVotes={Object.values(locationVotes)}
                selectionMade={!!getChosenLocation()}
              />
            )}
          </div>
        </div>

        <div className="col-span-3">
          <div className="w-full">
            <Calendar
              theShowUserChart={[showUserChart, setShowUserChart]}
              onClick={() => {
                if (showUserChart === true) {
                  return;
                }
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
              isGeneralDays={false}
            />
          </div>

          <div className="flex flex-row justify-between space-x-2  ">
            <div className="lg:pl-5 lg:ml-0 ml-3 mt-2">
              <ButtonSmall
                bgColor={'primary'}
                textColor={'white'}
                onClick={() => {
                  nav('/timeselect/' + code);
                }}
              >
                <span>&#8592;</span> Edit Your Availability
              </ButtonSmall>
            </div>

            {isAdmin &&
              calendarFramework?.dates?.[0][0].date instanceof Date &&
              (calendarFramework.dates[0][0].date as Date).getFullYear() !==
                2000 &&
              isAdmin && (
                <div className="lg:pr-5 lg:mr-0 mr-10">
                  <AddToGoogleCalendarButton
                    onClick={handleSelectionSubmission}
                  />
                </div>
              )}
          </div>

          <div className="pl-5 mt-2">
            <div className="p-1 flex-shrink w-full lg:w-[80%] text-gray-500 text-left text-sm">
              {locationOptions.length === 0 ? (
                <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press submit selection to GCAl" />
              ) : (
                <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press submit selection." />
              )}
            </div>
          </div>

          {/* Mobile Charts */}
          {locationOptions.length > 0 && (
            <div className="lg:hidden mt-4">
              <LocationChart
                theSelectedLocation={[
                  adminChosenLocation,
                  setAdminChosenLocation,
                ]}
                locationOptions={
                  locationOptions.length > 0 ? locationOptions : ['']
                }
                locationVotes={Object.values(locationVotes)}
                selectionMade={!!getChosenLocation()}
              />
            </div>
          )}

          {chartedUsers !== undefined && (
            <div
              className={`
            z-[9999] lg:hidden fixed bottom-0 left-0 right-0 
            transform transition-transform duration-300 ease-in-out
            bg-white dark:bg-secondary_background-dark shadow-lg
            ${showUserChart ? 'translate-y-0' : 'translate-y-full'}
          `}
            >
              <div className="p-4 rounded-t-xl">
                {/* Add a close button for mobile */}
                <button
                  onClick={() => setShowUserChart(false)}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>

                <UserChart chartedUsersData={[chartedUsers, setChartedUsers]} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showGeneralPopup && (
        <GeneralPopup
          onClose={() => setShowGeneralPopup(false)}
          message={generalPopupMessage}
          isLogin={false}
        />
      )}
    </div>
  );
}

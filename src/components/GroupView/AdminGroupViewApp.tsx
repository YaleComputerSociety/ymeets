import { useState, useEffect } from 'react';
import { checkIfAdmin } from '../../firebase/events';
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
    <div className="bg-background w-full px-4 lg:px-8 lg:px-12">
      <div className="lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col">
        <div className="lg:ml-5 lg:mt-5 col-span-1 gap-y-3 flex flex-col lg:items-start lg:justify-start items-center justify-center mb-3">
          <div className="text-4xl font-bold text-center lg:text-left">
            {eventName}
          </div>
          <div className="text-xl text-center lg:text-left">
            {eventDescription}
          </div>
          <button
            onClick={() => {
              copy(`${window.location.origin}/timeselect/${code}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className={`text-sm lg:text-base flex items-center justify-center ${
              copied
                ? 'bg-green-500 hover:bg-green-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            } border border-slate-300 font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors relative`}
          >
            {<IconCopy className="inline-block w-4 lg:w-5 mr-2" />}
            {copied ? 'Copied to Clipboard' : `Share Link: ${code}`}
          </button>

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
            />
          </div>

          <div className="flex flex-row justify-between space-x-2  ">
            <ButtonSmall
              bgColor={'primary'}
              textColor={'white'}
              onClick={() => {
                nav('/timeselect/' + code);
              }}
            >
              <span className="mr-1">&#8592;</span> Edit Your Availability
            </ButtonSmall>

            {isAdmin &&
              calendarFramework?.dates?.[0][0].date instanceof Date &&
              (calendarFramework.dates[0][0].date as Date).getFullYear() !==
                2000 && (
                <AddToGoogleCalendarButton
                  onClick={handleSelectionSubmission}
                />
              )}
          </div>

          <div className="pl-3 mt-2">
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
              className={`z-[9999] lg:hidden fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-in-out ${
                showUserChart ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="bg-white p-4 z-[9999] rounded-t-xl shadow-lg">
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

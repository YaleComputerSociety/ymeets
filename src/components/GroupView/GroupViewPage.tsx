import {
  useState,
  useEffect,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react';
import ButtonSmall from '../utils/components/ButtonSmall';
import {
  calanderState,
  userData,
  calendarDimensions,
  dragProperties,
} from '../../types';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { useCallback } from 'react';
import {
  getEventObjectForGCal,
  getParticipantIndex,
  getAccountId,
  getAccountName,
  getAccountEmail,
  getChosenLocation,
} from '../../backend/events';
import { useNavigate } from 'react-router-dom';
import LocationChart from './LocationChart';
import UserChart from './UserChart';
import EditAvailability from './EditAvailability';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import GeneralPopup from '../DaySelect/general_popup_component';
import AddToGoogleCalendarButton from './AddToCalendarButton';
import { useAuth } from '../../backend/authContext';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import InformationPopup from '../utils/components/InformationPopup';

import { useContext } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import AutoDraftEmailButton from '../utils/components/AutoDraftEmailButton';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { IconAdjustments, IconAdjustmentsFilled } from '@tabler/icons-react';
import AlertPopup from '../utils/components/AlertPopup';
import { getUserTimezone } from '../utils/functions/timzoneConversions';

/**
 * Group View (with all the availabilities) if you are logged in as the creator of the Event.
 * @returns Page Component
 */
export default function GroupViewPage({
  isAdmin,
  isEditing,
  toggleEditing,
  calendarState,
  setCalendarState,
  calendarFramework,
  setCalendarFramework,
  code,
  chartedUsers,
  setChartedUsers,
  eventName,
  setEventName,
  eventDescription,
  setEventDescription,
  locationVotes,
  setLocationVotes,
  locationOptions,
  setLocationOptions,
  adminChosenLocation,
  setAdminChosenLocation,
  loading,
  setLoading,
  allPeople,
  setAllPeople,
  peopleStatus,
  setPeopleStatus,
  allUsers,
  setAllUsers,
  userHasFilled,
  setUserHasFilled,
}: {
  isAdmin: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  calendarState: calanderState;
  setCalendarState: Dispatch<SetStateAction<calanderState>>;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;
  code: string | undefined;
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  eventName: string;
  setEventName: Dispatch<SetStateAction<string>>;
  eventDescription: string;
  setEventDescription: Dispatch<SetStateAction<string>>;
  locationVotes: any;
  setLocationVotes: Dispatch<SetStateAction<any>>;
  locationOptions: string[];
  setLocationOptions: Dispatch<SetStateAction<string[]>>;
  adminChosenLocation: string | undefined;
  setAdminChosenLocation: Dispatch<SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  allPeople: string[];
  setAllPeople: Dispatch<SetStateAction<string[]>>;
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  allUsers: userData;
  setAllUsers: Dispatch<SetStateAction<userData>>;
  userHasFilled: boolean;
  setUserHasFilled: Dispatch<SetStateAction<boolean>>;
}) {
  const [showUserChart, setShowUserChart] = useState(false);
  const [participantToggleClicked, setParticipantToggleClicked] =
    useState(true);
  const [showLocationChart, setShowLocationChart] = useState(false);
  const [showGeneralPopup, setShowGeneralPopup] = useState(false);
  const [generalPopupMessage] = useState('');
  const [dragState, setDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false, // true for selecting, false for deselecting
    lastPosition: null,
  });

  const { login, currentUser } = useAuth();

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

  async function handleSelectionSubmission() {
    if (!dragState.endPoint || !dragState.startPoint) {
      setAlertMessage('No new time selection made!');
      return;
    }

    const [startCol, startBlock] = dragState.startPoint;
    const [endCol, endBlock] = dragState.endPoint;

    if (startCol !== endCol) {
      setAlertMessage('You must select times that occur on the same day!');
      return;
    }

    const calDate = calendarFramework?.dates.flat()[startCol];
    const timeBlocks = generateTimeBlocks(
      calendarFramework?.startTime,
      calendarFramework?.endTime
    );

    const times = timeBlocks.flat();

    const selectedStartTimeHHMM: string = times.flat()[startBlock];
    const selectedEndTimeHHMM: string = times.flat()[endBlock];

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
      login();
    }
  }

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      user =
        calendarState !== undefined ? Object.keys(calendarState).length - 1 : 0;
    }
    return user;
  };

  const filteredChartedUsers = useMemo(
    () => ({
      ...chartedUsers,
      users: allUsers?.users?.filter(
        (user) => peopleStatus[user.name] === true
      ),
    }),
    [chartedUsers, peopleStatus]
  );

  const [alertMessage, setAlertMessage] = useState<string | null>(null); // Ensure this is at the top level
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null); // State for calendar height
  const editAvailabilityButtonLabel = isEditing
    ? 'View Availabilities'
    : userHasFilled
      ? 'Edit Your Availability'
      : 'Add Availability';

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingAnim />
      </div>
    );
  }



  return (
    <div className="w-full px-0 lg:px-8 mb-5 lg:mb-0">
      {/* Render AlertPopup unconditionally */}
      <AlertPopup
        title="Alert"
        message={alertMessage || ''}
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
      />

      <div className="lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col">
        <div className="text-text dark:text-text-dark lg:p-0 p-4 lg:ml-5 lg:mt-5 col-span-1 gap-y-3 flex flex-col lg:items-start lg:justify-start items-center justify-center mb-3">
          {!chartedUsers.hovering && 
          <div
            className="text-4xl font-bold text-center lg:text-left"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {eventName}
          </div>}
          {!chartedUsers.hovering && 
          <div
            className="text-xl text-center lg:text-left"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {eventDescription}
          </div>}
            {!chartedUsers.hovering && 
          <CopyCodeButton />}
          {!chartedUsers.hovering && 
          <ButtonSmall
            bgColor="primary"
            textColor="white"
            onClick={toggleEditing}
            className="hidden md:block"
          >
            {editAvailabilityButtonLabel}
          </ButtonSmall>

          {isAdmin && !chartedUsers.hovering && (
            <AutoDraftEmailButton
              eventTitle={eventName}
              yourName={getAccountName()}
              senderEmail={getAccountEmail()}
              customEventCode={code}
            />
          )}

          {locationOptions.length > 0 && !chartedUsers.hovering && (
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
        
          <div className="hidden lg:block w-full relative">
            {chartedUsers !== undefined && !showLocationChart && (
              <>
                { !chartedUsers.hovering && (participantToggleClicked ? (
                  <IconAdjustments
                    size={40}
                    onClick={() => {
                      setParticipantToggleClicked(!participantToggleClicked);
                    }}
                    className="cursor-pointer absolute -top-10 right-2 p-2"
                  />

                ) : (
                  <IconAdjustmentsFilled
                    size={40}
                    onClick={() => {
                      setParticipantToggleClicked(!participantToggleClicked);
                    }}
                    className="cursor-pointer absolute -top-10 right-2 p-2"
                  />
                )) }

                {!participantToggleClicked && 
                <EditAvailability
                    chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                    thePeopleStatus={[peopleStatus, setPeopleStatus]}
                    allPeople={allPeople}
                    theParticipantToggleClicked={[
                      participantToggleClicked,
                      setParticipantToggleClicked,
                    ]}
                    calendarHeight={calendarHeight}
                  />}

                {chartedUsers.hovering &&
                <UserChart
                  chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                  thePeopleStatus={[peopleStatus, setPeopleStatus]}
                  allPeople={allPeople}
                  theParticipantToggleClicked={[
                    participantToggleClicked,
                    setParticipantToggleClicked,
                  ]}
                  calendarHeight={calendarHeight}
                />}

                
                
              </>
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
            <div className="flex flex-col space-y-0 mb-2">
              <div className="flex justify-center ml-2 mr-2 md:justify-start md:ml-5 md:mr-5 md:mt-5 mb-2">
                {/* Mobile layout - buttons row */}
                <div className="flex flex-col md:hidden w-full mb-3">
                  <div className="flex items-center justify-center gap-3 w-full mb-3">
                    <ButtonSmall
                      bgColor="primary"
                      textColor="white"
                      onClick={toggleEditing}
                      className="!rounded-lg"
                    >
                      {editAvailabilityButtonLabel}
                    </ButtonSmall>
                    {isAdmin && (
                      <ButtonSmall
                        bgColor="secondary"
                        textColor="white"
                        onClick={() => nav(`/edit/${code}`)}
                        className="!rounded-lg"
                      >
                        Edit Event
                      </ButtonSmall>
                    )}
                  </div>
                  {/* Timezone and Export row */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <TimezoneChanger
                        theCalendarFramework={[
                          calendarFramework,
                          setCalendarFramework,
                        ]}
                        initialTimezone={(() => {
                          const urlParams = new URLSearchParams(
                            window.location.search
                          );
                          const urlTimezone = urlParams.get('tz');
                          return urlTimezone || getUserTimezone();
                        })()}
                      />
                    </div>
                    {isAdmin &&
                      calendarFramework?.dates?.[0][0].date instanceof Date &&
                      (calendarFramework.dates[0][0].date as Date).getFullYear() !== 2000 && (
                        <AddToGoogleCalendarButton onClick={handleSelectionSubmission} />
                      )}
                    <div className="lg:hidden">
                      {!participantToggleClicked ? (
                        <IconAdjustmentsFilled
                          size={30}
                          className="cursor-pointer dark:text-text-dark"
                          onClick={() => {
                            setParticipantToggleClicked(!participantToggleClicked);
                            setShowUserChart(false);
                          }}
                        />
                      ) : (
                        <IconAdjustments
                          size={30}
                          className="cursor-pointer dark:text-text-dark"
                          onClick={() => {
                            setParticipantToggleClicked(!participantToggleClicked);
                            setShowUserChart(true);
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      {isAdmin &&
                        (locationOptions.length === 0 ? (
                          <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press Export to GCal" />
                        ) : (
                          <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press Export to GCal." />
                        ))}
                    </div>
                  </div>
                </div>

                {/* Desktop layout - match edit mode exactly */}
                <div className="hidden md:flex w-full max-w-full justify-between items-center space-x-2">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <ButtonSmall
                          bgColor="secondary"
                          textColor="white"
                          onClick={() => nav(`/edit/${code}`)}
                        >
                          Edit Event
                        </ButtonSmall>
                      )}
                    </div>
                    <div className="flex-1 ml-2">
                      <TimezoneChanger
                        theCalendarFramework={[
                          calendarFramework,
                          setCalendarFramework,
                        ]}
                        initialTimezone={(() => {
                          // TODO: saving this as a reminder to add URL parameters once we merge in SPA code that supports it
                          const urlParams = new URLSearchParams(
                            window.location.search
                          );
                          const urlTimezone = urlParams.get('tz');

                          return urlTimezone || getUserTimezone();
                        })()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin ? <AddToGoogleCalendarButton onClick={handleSelectionSubmission} />: null}
                    {isAdmin &&
                      (locationOptions.length === 0 ? (
                        <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press Export to GCal" />
                      ) : (
                        <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press Export to GCal." />
                      ))}
                  </div>
                </div>
              </div>

              <Calendar
                theShowUserChart={[showUserChart, setShowUserChart]}
                onClick={() => {
                  if (isAdmin) {
                    // Reset drag selection when the calendar is clicked
                    setDragState({
                      isSelecting: false,
                      startPoint: null,
                      endPoint: null,
                      selectionMode: false,
                      lastPosition: null,
                    });
                  }
                  if (showUserChart === true) {
                    return;
                  }
                  setShowUserChart(true);
                  setTimeout(() => setShowUserChart(false), 3000);
                }}
                theCalendarState={[calendarState, setCalendarState]}
                theCalendarFramework={[calendarFramework, setCalendarFramework]}
                chartedUsersData={[filteredChartedUsers, setChartedUsers]}
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
                setChartedUsers={setChartedUsers}
                chartedUsers={chartedUsers}
                setCalendarHeight={setCalendarHeight}
              />
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
            <div className="lg:hidden">
              <div
                className={`
            z-[9999]  fixed bottom-0 left-0 right-0 
            transform transition-transform ${!participantToggleClicked ? 'duration-300' : ''} ease-in-out
            bg-white dark:bg-secondary_background-dark shadow-lg
            ${showUserChart ? 'translate-y-0' : 'translate-y-full'}
            `}
              >
                <div className="p-4 rounded-t-xl">
                  <button
                    onClick={() => setShowUserChart(false)}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    &times;
                  </button>

                  <UserChart
                    chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                    thePeopleStatus={[peopleStatus, setPeopleStatus]}
                    allPeople={allPeople}
                    theParticipantToggleClicked={[
                      participantToggleClicked,
                      setParticipantToggleClicked,
                    ]}
                    calendarHeight={calendarHeight}
                  />

                  <EditAvailability
                    chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                    thePeopleStatus={[peopleStatus, setPeopleStatus]}
                    allPeople={allPeople}
                    theParticipantToggleClicked={[
                      participantToggleClicked,
                      setParticipantToggleClicked,
                    ]}
                    calendarHeight={calendarHeight}
                  />
                </div>
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

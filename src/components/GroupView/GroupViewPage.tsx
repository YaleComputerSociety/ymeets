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
  getEmailAdmin,
  setEmailAdmin,
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
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { IconAdjustments, IconAdjustmentsFilled } from '@tabler/icons-react';
import AlertPopup from '../utils/components/AlertPopup';
import DeletePopup from '../utils/components/DeletePopup';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import { deleteEvent } from '../../backend/events';

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
  const [showParticipantFilter, setShowParticipantFilter] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
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

  // Close menu when clicking outside
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const menuButton = document.getElementById('event-menu-button');
        const menuDropdown = document.getElementById('event-menu-dropdown');

        if (!menuButton?.contains(target) && !menuDropdown?.contains(target)) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleDeleteEvent = async () => {
    if (code) {
      await deleteEvent(code);
      nav('/');
    }
  };

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
  const [emailNotifications, setEmailNotifications] = useState(getEmailAdmin());
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
        <div
          className="text-text dark:text-text-dark lg:p-0 p-4 lg:ml-5 lg:mt-5 col-span-1 gap-y-4 flex flex-col lg:items-start lg:justify-start items-center justify-center mb-3"
          style={
            calendarHeight
              ? { maxHeight: calendarHeight + 60, height: 'fit-content' }
              : undefined
          }
        >
          {/* Event Title & Description */}
          {!chartedUsers.hovering && (
            <div className="w-full">
              <div className="flex items-start justify-between gap-2">
                <div
                  className="text-3xl font-bold text-center lg:text-left flex-1 min-w-0"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {eventName}
                </div>
                {isAdmin && (
                  <div className="relative flex-shrink-0">
                    <button
                      id="event-menu-button"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Event options"
                    >
                      <IconDotsVertical
                        size={20}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>
                    {isMenuOpen && (
                      <div
                        id="event-menu-dropdown"
                        className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            nav(`/edit/${code}`);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                        >
                          <IconPencil size={16} />
                          Edit Event
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowDeletePopup(true);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <IconTrash size={16} />
                          Delete Event
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {eventDescription && (
                <div
                  className="text-base text-gray-600 dark:text-gray-400 text-center lg:text-left mt-1"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {eventDescription}
                </div>
              )}
            </div>
          )}

          {/* Primary Action */}
          {!chartedUsers.hovering && (
            <div className="hidden md:flex items-center gap-2 w-full">
              <ButtonSmall
                bgColor="primary"
                textColor="white"
                onClick={toggleEditing}
                className="flex-1"
              >
                {editAvailabilityButtonLabel}
              </ButtonSmall>
            </div>
          )}

          {/* Share Section */}
          {!chartedUsers.hovering && (
            <div className="w-full">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Share
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <CopyCodeButton className="!w-auto flex-1 !text-xs !py-1.5 !px-2" />
                  {isAdmin && (
                    <AutoDraftEmailButton
                      eventTitle={eventName}
                      yourName={getAccountName()}
                      senderEmail={getAccountEmail()}
                      customEventCode={code}
                      className="flex-1 !text-xs !py-1.5 !px-2"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Settings Section */}
          {isAdmin && !chartedUsers.hovering && (
            <div className="w-full">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Settings
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Email notifications
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={async (e) => {
                        const newValue = e.target.checked;
                        setEmailNotifications(newValue);
                        await setEmailAdmin(newValue);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary-400/50 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-primary dark:peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get notified when someone fills out their availability
                </p>
              </div>
            </div>
          )}

          {/* Participants Section - expands to fill remaining space up to calendar height */}
          {!chartedUsers.hovering && allPeople && allPeople.length > 0 && (
            <div className="hidden lg:flex lg:flex-col w-full flex-1 min-h-0">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex-shrink-0">
                Participants (
                {allPeople.filter((name) => peopleStatus[name]).length}/
                {allPeople.length})
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 overflow-y-auto flex-1">
                {allPeople.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                    onClick={() => {
                      if (
                        allPeople.filter((person) => peopleStatus[person])
                          .length === 1 &&
                        peopleStatus[name]
                      ) {
                        setAlertMessage(
                          "You can't remove the last participant"
                        );
                        return;
                      }
                      setPeopleStatus((prev) => ({
                        ...prev,
                        [name]: !prev[name],
                      }));
                    }}
                  >
                    <span
                      className={`text-sm ${peopleStatus[name] ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      {name}
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        peopleStatus[name]
                          ? 'bg-primary border-primary'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {peopleStatus[name] && (
                        <IconCheck size={12} className="text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Chart Section */}
          {locationOptions.length > 0 && !chartedUsers.hovering && (
            <div className="hidden lg:block w-full">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Locations
              </div>
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

          {/* Hover User Chart - shows available/unavailable when hovering on calendar */}
          {chartedUsers.hovering && (
            <div className="hidden lg:block w-full">
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
            </div>
          )}
        </div>

        <div className="col-span-3">
          <div className="w-full">
            <div className="flex flex-col space-y-0 mb-2">
              <div className="flex justify-center ml-2 mr-2 md:justify-start md:ml-5 md:mr-5 md:mt-5 mb-2">
                {/* Mobile layout - buttons row */}
                <div className="flex flex-col md:hidden w-full mb-3">
                  <div className="flex items-center justify-center gap-2 w-full mb-3">
                    <ButtonSmall
                      bgColor="primary"
                      textColor="white"
                      onClick={toggleEditing}
                      className="!rounded-lg flex-1"
                    >
                      {editAvailabilityButtonLabel}
                    </ButtonSmall>
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
                      (
                        calendarFramework.dates[0][0].date as Date
                      ).getFullYear() !== 2000 && (
                        <AddToGoogleCalendarButton
                          onClick={handleSelectionSubmission}
                        />
                      )}
                    <div className="lg:hidden">
                      <IconAdjustments
                        size={30}
                        className="cursor-pointer dark:text-text-dark"
                        onClick={() => setShowParticipantFilter(true)}
                      />
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

                {/* Desktop layout - Timezone fills space, Export on right */}
                <div className="hidden md:flex w-full max-w-full items-center gap-2">
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
                  <div className="flex items-center space-x-2">
                    {isAdmin ? (
                      <AddToGoogleCalendarButton
                        onClick={handleSelectionSubmission}
                      />
                    ) : null}
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

          {/* Mobile Popup 1: Availability Chart (shows when hovering/clicking calendar) */}
          {chartedUsers !== undefined && (
            <div className="lg:hidden">
              <div
                className={`
                  z-[9999] fixed bottom-0 left-0 right-0
                  transform transition-transform duration-300 ease-in-out
                  bg-white dark:bg-secondary_background-dark shadow-lg rounded-t-xl
                  ${showUserChart ? 'translate-y-0' : 'translate-y-full'}
                `}
              >
                <div className="p-4">
                  <button
                    onClick={() => setShowUserChart(false)}
                    className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
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
                </div>
              </div>
            </div>
          )}

          {/* Mobile Popup 2: Participant Filter (shows when clicking filter icon) */}
          <div className="lg:hidden">
            <div
              className={`
                z-[9999] fixed bottom-0 left-0 right-0
                transform transition-transform duration-300 ease-in-out
                bg-white dark:bg-secondary_background-dark shadow-lg rounded-t-xl
                ${showParticipantFilter ? 'translate-y-0' : 'translate-y-full'}
              `}
            >
              <div className="p-4">
                <button
                  onClick={() => setShowParticipantFilter(false)}
                  className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                >
                  &times;
                </button>

                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Filter Participants (
                  {allPeople?.filter((name) => peopleStatus[name]).length}/
                  {allPeople?.length})
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {allPeople?.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 -mx-2"
                      onClick={() => {
                        if (
                          allPeople.filter((person) => peopleStatus[person])
                            .length === 1 &&
                          peopleStatus[name]
                        ) {
                          setAlertMessage(
                            "You can't remove the last participant"
                          );
                          return;
                        }
                        setPeopleStatus((prev) => ({
                          ...prev,
                          [name]: !prev[name],
                        }));
                      }}
                    >
                      <span
                        className={`text-sm ${peopleStatus[name] ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          peopleStatus[name]
                            ? 'bg-primary border-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {peopleStatus[name] && (
                          <IconCheck size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGeneralPopup && (
        <GeneralPopup
          onClose={() => setShowGeneralPopup(false)}
          message={generalPopupMessage}
          isLogin={false}
        />
      )}

      <DeletePopup
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        isOpen={showDeletePopup}
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeletePopup(false)}
      />
    </div>
  );
}

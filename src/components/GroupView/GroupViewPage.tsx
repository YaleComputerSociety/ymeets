import BestTimeFinder from '../BestTimeFinder';
import { windowToSelection } from '../utils/functions/findBestTimes';
import type { BestTimeWindow } from '../utils/functions/findBestTimes';
import {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react';
import ButtonSmall from '../utils/components/ButtonSmall';
import {
  BoundingBox,
  DraggedSelection,
  calendarState,
  userData,
  calendarDimensions,
} from '../../types';
import Calendar from '../selectCalendarComponents/CalendarApp';
import { useNavigate } from 'react-router-dom';
import {
  getParticipantIndex,
  getAccountId,
  getAccountName,
  getAccountEmail,
  getChosenLocation,
  getEmailAdmin,
  setEmailAdmin,
  wrappedSaveDeclinedParticipantDetails,
} from '../../backend/events';
import LocationChart from './LocationChart';
import UserChart from './UserChart';
import { getGCalUrlForSelection } from '../utils/functions/googleCalendarExport';
import GeneralPopup from '../DaySelect/general_popup_component';
import AddToGoogleCalendarButton from './AddToCalendarButton';
import { useAuth } from '../../backend/authContext';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import InformationPopup from '../utils/components/InformationPopup';

import CopyCodeButton from '../utils/components/CopyCodeButton';
import AutoDraftEmailButton from '../utils/components/AutoDraftEmailButton';
import { IconCheck } from '@tabler/icons-react';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { IconAdjustments } from '@tabler/icons-react';
import AlertPopup from '../utils/components/AlertPopup';
import EventOptionsMenu from '../utils/components/EventOptionsMenu';
import { SKIP_UNSAVED_CHANGES_PROMPT } from '../utils/functions/navigationState';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import ParticipantFilterList, {
  getFilterableParticipants,
} from '../utils/components/ParticipantFilterList';

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
  eventDescription,
  locationVotes,
  locationOptions,
  adminChosenLocation,
  loading,
  allPeople,
  declinedPeople,
  peopleStatus,
  setPeopleStatus,
  allUsers,
  userHasFilled,
}: {
  isAdmin: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  calendarState: calendarState;
  setCalendarState: Dispatch<SetStateAction<calendarState>>;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;
  code: string | undefined;
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  eventName: string;
  eventDescription: string;
  locationVotes: any;
  locationOptions: string[];
  adminChosenLocation: string | undefined;
  loading: boolean;
  allPeople: string[];
  declinedPeople: string[];
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  allUsers: userData;
  userHasFilled: boolean;
}) {
  const navigate = useNavigate();
  const [showUserChart, setShowUserChart] = useState(false);
  const [showParticipantFilter, setShowParticipantFilter] = useState(false);
  const [showGeneralPopup, setShowGeneralPopup] = useState(false);
  const [dragState, setDragState] = useState<DraggedSelection | undefined>(undefined);
  const [mostRecentSelection, setMostRecentSelection] = useState<BoundingBox | undefined>(undefined);
  const [showBestTime, setShowBestTime] = useState(false);

  const { login } = useAuth();

  /** Opens a pre-filled Google Calendar event for the admin's selected time range. */
  function handleSelectionSubmission() {
    const result = getGCalUrlForSelection(
      mostRecentSelection,
      calendarFramework,
      adminChosenLocation
    );
    if ('error' in result) {
      setAlertMessage(result.error);
      return;
    }

    if (getAccountId() !== '') {
      window.open(result.url, '_blank');
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
        (user) => peopleStatus[user.name] && !declinedPeople.includes(user.name)
      ),
    }),
    [chartedUsers, allUsers, peopleStatus, declinedPeople]
  );
  const participantCounts = getFilterableParticipants(
    allPeople,
    declinedPeople,
    peopleStatus
  );
  // ----- Best time finder (admins) -----
  // Names indexed by calendarState position (user.id is that position)
  const bestTimePersonNames: string[] = [];
  allUsers?.users?.forEach((u) => {
    bestTimePersonNames[u.id] = u.name;
  });

  // Called when the admin clicks "Choose this time" in the popup.
  // Opens a prefilled Google Calendar event (same export as "Export to GCal").
  const handleBestTimeSelect = (time: BestTimeWindow) => {
    const result = getGCalUrlForSelection(
      windowToSelection(time),
      calendarFramework,
      adminChosenLocation
    );
    if ('error' in result) {
      setShowBestTime(false); // close first, or the alert is hidden behind it
      setAlertMessage(result.error);
      return;
    }

    if (getAccountId() !== '') {
      window.open(result.url, '_blank');
    } else {
      login();
    }
    setShowBestTime(false); // close the popup
  };


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
            {/* Best Time popup */}
      {isAdmin && showBestTime && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowBestTime(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 z-10 text-2xl text-white hover:text-gray-300"
              onClick={() => setShowBestTime(false)}
              aria-label="Close"
            >
              ×
            </button>

            <BestTimeFinder
              availabilities={calendarState}
              // Same people the group calendar shows: checked and not declined
              personIdx={(filteredChartedUsers.users ?? []).map((u) => u.id)}
              personNames={bestTimePersonNames}
              calendarFramework={calendarFramework}
              onSelect={handleBestTimeSelect}
            />
          </div>
        </div>
      )}

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
                <EventOptionsMenu
                  eventCode={code}
                  isAdmin={isAdmin}
                  userHasFilled={userHasFilled}
                  onCancel={async () => {
                    await wrappedSaveDeclinedParticipantDetails();
                    navigate('/', { state: SKIP_UNSAVED_CHANGES_PROMPT });
                  }}
                />
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
                          "You can't remove the last participant!"
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
                selectedLocation={adminChosenLocation}
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
                chartedUsers={filteredChartedUsers}
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
                    {isAdmin && (
                      <ButtonSmall
                        bgColor="primary"
                        textColor="white"
                        onClick={() => setShowBestTime(true)}
                        className="!rounded-lg flex-1">
                        Find best time
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
                    {/* The filter sheet is lg:hidden; at lg+ the sidebar holds the participant list */}
                    <IconAdjustments
                      size={30}
                      className="cursor-pointer dark:text-text-dark lg:hidden"
                      onClick={() => setShowParticipantFilter(true)}
                      aria-label="Filter participants"
                    />
                    {isAdmin && (
                      <ButtonSmall
                        bgColor="primary"
                        textColor="white"
                        onClick={() => setShowBestTime(true)}
                        className="!rounded-lg"
                      >
                        Find best time
                      </ButtonSmall>
                    )}
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
                    // Ends any in-progress drag. The green selection (mostRecentSelection) is kept.
                    setDragState(undefined);
                  }
                  if (showUserChart === true) {
                    return;
                  }
                  setShowUserChart(true);
                  setTimeout(() => setShowUserChart(false), 3000);
                }}
                theCalendarState={[calendarState, setCalendarState]}
		calendarFramework={calendarFramework}
                chartedUsersData={[filteredChartedUsers, setChartedUsers]}
                draggable={
                  isAdmin
                }
                user={getCurrentUserIndex()}
                isAdmin={isAdmin}
                theDragState={[dragState, setDragState]}
                theMostRecentSelection={[mostRecentSelection, setMostRecentSelection]}
                googleCalendarEvents={[]}
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
                selectedLocation={adminChosenLocation}
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
                    chartedUsers={filteredChartedUsers}
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
                  Filter Participants ({participantCounts.shownCount}/
                  {participantCounts.people.length})
                </div>

                {/* -mx-2 px-2 matches the rows' -mx-2 hover bleed, so it doesn't overflow sideways */}
                <div className="max-h-64 overflow-y-auto -mx-2 px-2">
                  <ParticipantFilterList
                    allPeople={allPeople}
                    declinedPeople={declinedPeople}
                    peopleStatus={peopleStatus}
                    setPeopleStatus={setPeopleStatus}
                    onRemoveLastParticipant={() =>
                      setAlertMessage("You can't remove the last participant!")
                    }
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGeneralPopup && (
        <GeneralPopup
          onClose={() => setShowGeneralPopup(false)}
          message={''}
          isLogin={false}
        />
      )}
    </div>
  );
}

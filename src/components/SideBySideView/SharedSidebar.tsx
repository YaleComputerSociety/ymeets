import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { userData } from '../../types';
import {
  getAccountName,
  getAccountEmail,
  getAccountId,
  getChosenLocation,
  getEmailAdmin,
  setEmailAdmin,
  updateAnonymousUserToAuthUser,
  getSelectedCalendarIDsByUserID,
  setUserSelectedCalendarIDs,
} from '../../backend/events';
import LocationChart from '../GroupView/LocationChart';
import LocationSelectionComponent from '../TimeSelect/LocationSelectionComponent';
import UserChart from '../GroupView/UserChart';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import AutoDraftEmailButton from '../utils/components/AutoDraftEmailButton';
import EventOptionsMenu from '../utils/components/EventOptionsMenu';
import AlertPopup from '../utils/components/AlertPopup';
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useGoogleCalendar } from '../../backend/useGoogleCalService';
import { useAuth } from '../../backend/authContext';
import GCAL_LOGO from './gcal-logo.png'
import LoginPopup from '../utils/components/LoginPopup';
import ButtonSmall from '../utils/components/ButtonSmall';

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

interface SharedSidebarProps {
  eventName: string;
  eventDescription: string;
  code: string | undefined;
  isAdmin: boolean;

  // Participants
  allPeople: string[];
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;

  // Location
  locationOptions: string[];
  locationVotes: any;
  adminChosenLocation: string | undefined;
  setAdminChosenLocation?: Dispatch<SetStateAction<string | undefined>>;

  // User chart
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;

  // Layout sync
  calendarHeight?: number | null;

  // For participant toggle
  participantToggleClicked?: boolean;
  setParticipantToggleClicked?: Dispatch<SetStateAction<boolean>>;

  // Google Calendar integration
  googleCalendars?: Calendar[];
  setGoogleCalendars?: Dispatch<SetStateAction<Calendar[]>>;
  selectedCalendarIds?: string[];
  setSelectedCalendarIds?: Dispatch<SetStateAction<string[]>>;

  // Location selection (user's preferred locations)
  selectedLocations?: string[];
  setSelectedLocations?: Dispatch<SetStateAction<string[]>>;

  // User signed-in state
  userHasSignedIn: boolean;
  onUserSignIn: () => void;
}

export default function SharedSidebar({
  eventName,
  eventDescription,
  code,
  isAdmin,
  allPeople,
  peopleStatus,
  setPeopleStatus,
  locationOptions,
  locationVotes,
  adminChosenLocation,
  setAdminChosenLocation,
  chartedUsers,
  setChartedUsers,
  calendarHeight,
  participantToggleClicked = true,
  setParticipantToggleClicked,
  googleCalendars = [],
  setGoogleCalendars,
  selectedCalendarIds = [],
  setSelectedCalendarIds,
  selectedLocations = [],
  setSelectedLocations,
  userHasSignedIn,
  onUserSignIn,
}: SharedSidebarProps) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(getEmailAdmin());
  const [isCalendarsExpanded, setIsCalendarsExpanded] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { hasAccess, requestAccess, getCalendars } = useGoogleCalendar();
  const { login, currentUser } = useAuth();

  // Load saved calendar preferences on mount
  useEffect(() => {
    const loadSavedCalendarPreferences = async () => {
      const uid = getAccountId();
      if (!uid || !hasAccess) return;

      try {
        const savedCalendarIds = await getSelectedCalendarIDsByUserID(uid);
        if (savedCalendarIds.length > 0 && setSelectedCalendarIds) {
          setSelectedCalendarIds(savedCalendarIds);
        }
      } catch (error) {
        console.error('Error loading saved calendar preferences:', error);
      }
    };

    loadSavedCalendarPreferences();
  }, [hasAccess, setSelectedCalendarIds]);

  const fetchUserCalendars = async () => {
    try {
      if (!hasAccess) {
        return [];
      }
      const calendars = await getCalendars();
      if (setGoogleCalendars) {
        setGoogleCalendars(calendars);
      }
      return calendars;
    } catch (error) {
      console.error('Error fetching Google Calendars:', error);
      return [];
    }
  };

  const handleCalendarToggle = (calId: string) => {
    if (setSelectedCalendarIds) {
      setSelectedCalendarIds((prevState) => {
        const newSelectedIds = prevState?.includes(calId)
          ? prevState.filter((id) => id !== calId)
          : [...(prevState || []), calId];

        // Save the updated calendar preferences
        const uid = getAccountId();
        if (uid) {
          setUserSelectedCalendarIDs(uid, newSelectedIds);
        }

        return newSelectedIds;
      });
    }
  };

  const handleSignIn = async () => {
    if (currentUser && !hasAccess) {
      await requestAccess();
      await fetchUserCalendars();
    } else {
      const user = await login();
      if (user) {
        updateAnonymousUserToAuthUser(getAccountName());
        const scopeGranted = await requestAccess();
        if (scopeGranted) {
          await fetchUserCalendars();
        }
      }
    }
  };

  const filteredChartedUsers = {
    ...chartedUsers,
    users: chartedUsers?.users?.filter(
      (user) => peopleStatus[user.name] === true
    ),
  };

  return (
    <div className="gap-y-4 flex flex-col w-full h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
      <AlertPopup
        title="Alert"
        message={alertMessage || ''}
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
      />

      {/* Event Title & Description */}
      {!chartedUsers?.hovering && (
        <div className="w-full">
          <div className="flex items-start justify-between gap-2">
            <div
              className="text-3xl font-bold flex-1 min-w-0"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {eventName}
            </div>
            {isAdmin && <EventOptionsMenu eventCode={code} />}
          </div>
          {eventDescription && (
            <div
              className="text-base text-gray-600 dark:text-gray-400 mt-1"
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

      {/* Add My Availability Button - shown when user is not signed in */}
      {!chartedUsers?.hovering && !userHasSignedIn && (
        <div className="w-full">
          <ButtonSmall
            bgColor="primary"
            textColor="white"
            onClick={() => setShowLoginPopup(true)}
            className="w-full"
          >
            Add My Availability
          </ButtonSmall>
        </div>
      )}

      {/* Share Section */}
      {!chartedUsers?.hovering && (
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
      {isAdmin && !chartedUsers?.hovering && (
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
              Get notified when someone adds their availability
            </p>
          </div>
        </div>
      )}

      {/* Google Calendar Section - only show when user is signed in */}
      {!chartedUsers?.hovering && userHasSignedIn && (
        <div className="w-full">
          <div
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between cursor-pointer"
            onClick={() =>
              currentUser &&
              hasAccess &&
              googleCalendars.length > 0 &&
              setIsCalendarsExpanded(!isCalendarsExpanded)
            }
          >
            <span>
              Your Calendars{' '}
              {currentUser &&
                hasAccess &&
                googleCalendars.length > 0 &&
                `(${selectedCalendarIds.length} selected)`}
            </span>
            {currentUser &&
              hasAccess &&
              googleCalendars.length > 0 &&
              (isCalendarsExpanded ? (
                <IconChevronUp
                  size={14}
                  className="text-gray-500 dark:text-gray-400"
                />
              ) : (
                <IconChevronDown
                  size={14}
                  className="text-gray-500 dark:text-gray-400"
                />
              ))}
          </div>
          {(!currentUser || !hasAccess) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Import your calendars to see your events
                </p>
                <button
                  className="font-bold rounded-full shadow-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 py-2 px-3 text-xs
                  flex items-center justify-center transform transition-transform hover:scale-95 active:scale-100"
                  onClick={handleSignIn}
                >
                  <img src={GCAL_LOGO} alt="GCal Logo" className="mr-1 h-6" />
                  Import Calendars
                </button>
              </div>
            </div>
          )}
          {currentUser && hasAccess && isCalendarsExpanded && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ul className="space-y-1 overflow-y-auto max-h-[120px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
                {googleCalendars.map((cal) => (
                  <li
                    key={cal.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    onClick={() => handleCalendarToggle(cal.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm mr-3 flex-shrink-0 flex items-center justify-center ${
                        selectedCalendarIds?.includes(cal.id)
                          ? 'bg-primary dark:bg-blue-700'
                          : 'bg-transparent'
                      } border border-gray-400 dark:border-gray-600`}
                    >
                      {selectedCalendarIds?.includes(cal.id) && (
                        <IconCheck size={12} color="white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {cal.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Participants Section */}
      {!chartedUsers?.hovering && allPeople && allPeople.length > 0 && (
        <div className="w-full">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Participants (
            {allPeople.filter((name) => peopleStatus[name]).length}/
            {allPeople.length})
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
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
                    setAlertMessage("You can't remove the last participant");
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

      {/* Locations Section - grouped together */}
      {locationOptions.length > 0 && !chartedUsers?.hovering && (
        <div className="w-full">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Locations
          </div>
          <div className="space-y-3">
            {/* User's location vote - only show when signed in */}
            {userHasSignedIn && (
              <div className="z-50 relative">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Cast your vote
                </div>
                <LocationSelectionComponent
                  locations={locationOptions}
                  value={selectedLocations}
                  update={(selected) => setSelectedLocations && setSelectedLocations(selected)}
                />
              </div>
            )}
            {/* Group's location votes */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Group votes
              </div>
              <LocationChart
                theSelectedLocation={[
                  adminChosenLocation,
                  setAdminChosenLocation || (() => {}),
                ]}
                locationOptions={
                  locationOptions.length > 0 ? locationOptions : ['']
                }
                locationVotes={Object.values(locationVotes)}
                selectionMade={!!getChosenLocation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hover User Chart - shows available/unavailable when hovering on calendar */}
      {chartedUsers?.hovering && (
        <div className="w-full">
          <UserChart
            chartedUsersData={[filteredChartedUsers, setChartedUsers]}
            thePeopleStatus={[peopleStatus, setPeopleStatus]}
            allPeople={allPeople}
            theParticipantToggleClicked={[
              participantToggleClicked,
              setParticipantToggleClicked || (() => {}),
            ]}
            calendarHeight={calendarHeight ?? null}
          />
        </div>
      )}

      {/* Login Popup */}
      {showLoginPopup && (
        <LoginPopup
          onClose={(successFlag) => {
            setShowLoginPopup(false);
            if (successFlag) {
              onUserSignIn();
            }
          }}
          enableAnonymousSignIn={true}
          code={code || ''}
        />
      )}
    </div>
  );
}

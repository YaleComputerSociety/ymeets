import { Dispatch, SetStateAction, useState } from 'react';
import { userData } from '../../types';
import {
  getAccountName,
  getAccountEmail,
  getChosenLocation,
  getEmailAdmin,
  setEmailAdmin,
} from '../../backend/events';
import LocationChart from '../GroupView/LocationChart';
import UserChart from '../GroupView/UserChart';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import AutoDraftEmailButton from '../utils/components/AutoDraftEmailButton';
import EventOptionsMenu from '../utils/components/EventOptionsMenu';
import AlertPopup from '../utils/components/AlertPopup';
import { IconCheck } from '@tabler/icons-react';

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
}: SharedSidebarProps) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(getEmailAdmin());

  const filteredChartedUsers = {
    ...chartedUsers,
    users: chartedUsers?.users?.filter(
      (user) => peopleStatus[user.name] === true
    ),
  };

  return (
    <div className="gap-y-4 flex flex-col w-full">
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
              Get notified when someone fills out their availability
            </p>
          </div>
        </div>
      )}

      {/* Participants Section */}
      {!chartedUsers?.hovering && allPeople && allPeople.length > 0 && (
        <div className="w-full flex-1 min-h-0 flex flex-col">
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
                    allPeople.filter((person) => peopleStatus[person]).length ===
                      1 &&
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

      {/* Location Chart Section */}
      {locationOptions.length > 0 && !chartedUsers?.hovering && (
        <div className="w-full">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Locations
          </div>
          <LocationChart
            theSelectedLocation={[
              adminChosenLocation,
              setAdminChosenLocation || (() => {}),
            ]}
            locationOptions={locationOptions.length > 0 ? locationOptions : ['']}
            locationVotes={Object.values(locationVotes)}
            selectionMade={!!getChosenLocation()}
          />
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
    </div>
  );
}

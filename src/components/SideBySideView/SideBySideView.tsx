import {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { calendar_v3 } from 'googleapis';
import {
  calanderState,
  userData,
  calendarDimensions,
  dragProperties,
} from '../../types';
import {
  getParticipantIndex,
  getAccountId,
  getAccountName,
} from '../../backend/events';
import Calendar from '../selectCalendarComponents/CalendarApp';
import SharedSidebar from './SharedSidebar';
import ViewModeToggle, { ViewMode } from './ViewModeToggle';
import TimezoneChanger from '../utils/components/TimezoneChanger';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import ButtonSmall from '../utils/components/ButtonSmall';

interface SideBySideViewProps {
  // Calendar states
  timeSelectCalendarState: calanderState;
  setTimeSelectCalendarState: Dispatch<SetStateAction<calanderState>>;
  groupViewCalendarState: calanderState;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;

  // User data
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  allPeople: string[];
  allUsers: userData;
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;

  // Event data
  eventName: string;
  eventDescription: string;
  locationOptions: string[];
  locationVotes: any;
  adminChosenLocation: string | undefined;
  setAdminChosenLocation: Dispatch<SetStateAction<string | undefined>>;

  // Other
  code: string | undefined;
  isAdmin: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  currentViewMode: ViewMode;
  isGeneralDays: boolean;

  // Google Calendar events for TimeSelect side
  googleCalendarEvents: calendar_v3.Schema$Event[];
  setGoogleCalendarEvents: Dispatch<
    SetStateAction<calendar_v3.Schema$Event[]>
  >;

  // Save functionality
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function SideBySideView({
  timeSelectCalendarState,
  setTimeSelectCalendarState,
  groupViewCalendarState,
  calendarFramework,
  setCalendarFramework,
  chartedUsers,
  setChartedUsers,
  allPeople,
  allUsers,
  peopleStatus,
  setPeopleStatus,
  eventName,
  eventDescription,
  locationOptions,
  locationVotes,
  adminChosenLocation,
  setAdminChosenLocation,
  code,
  isAdmin,
  onViewModeChange,
  currentViewMode,
  isGeneralDays,
  googleCalendarEvents,
  setGoogleCalendarEvents,
  onSave,
  isSaving,
}: SideBySideViewProps) {
  const [showUserChart, setShowUserChart] = useState(false);
  const [participantToggleClicked, setParticipantToggleClicked] = useState(true);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);

  // Drag state for left calendar (TimeSelect - user editing)
  const [leftDragState, setLeftDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false,
    lastPosition: null,
  });

  // Drag state for right calendar (GroupView - read-only, no drag)
  const [rightDragState, setRightDragState] = useState<dragProperties>({
    isSelecting: false,
    startPoint: null,
    endPoint: null,
    selectionMode: false,
    lastPosition: null,
  });

  // Get current user index
  const getCurrentUserIndex = useCallback(() => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) {
      user =
        timeSelectCalendarState !== undefined
          ? Object.keys(timeSelectCalendarState).length - 1
          : 0;
    }
    return user;
  }, [timeSelectCalendarState]);

  // Real-time sync: Derive GroupView state from TimeSelect state
  // This ensures the right calendar updates instantly when the user makes selections on the left
  const derivedGroupViewState = useMemo(() => {
    const userIndex = getCurrentUserIndex();
    const newState = [...groupViewCalendarState];

    if (timeSelectCalendarState[userIndex]) {
      newState[userIndex] = timeSelectCalendarState[userIndex];
    }
    return newState;
  }, [timeSelectCalendarState, groupViewCalendarState, getCurrentUserIndex]);

  // Filter charted users based on people status
  const filteredChartedUsers = useMemo(
    () => ({
      ...chartedUsers,
      users: allUsers?.users?.filter(
        (user) => peopleStatus[user.name] === true
      ),
    }),
    [chartedUsers, allUsers, peopleStatus]
  );

  // No-op setter for read-only calendar
  const noop = useCallback(() => {}, []);

  return (
    <div className="w-full px-0 lg:px-8 mb-5 lg:mb-0">
      {/* View mode toggle - top right */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <TimezoneChanger
            theCalendarFramework={[calendarFramework, setCalendarFramework]}
            initialTimezone={(() => {
              const urlParams = new URLSearchParams(window.location.search);
              const urlTimezone = urlParams.get('tz');
              return urlTimezone || getUserTimezone();
            })()}
          />
        </div>
        <div className="flex items-center gap-3">
          <ButtonSmall
            bgColor="primary"
            textColor="white"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </ButtonSmall>
          <ViewModeToggle
            currentMode={currentViewMode}
            onModeChange={onViewModeChange}
          />
        </div>
      </div>

      {/* Main layout: 5-column grid */}
      <div className="grid grid-cols-5 gap-3">
        {/* Sidebar - 1 column */}
        <div className="col-span-1">
          <SharedSidebar
            eventName={eventName}
            eventDescription={eventDescription}
            code={code}
            isAdmin={isAdmin}
            allPeople={allPeople}
            peopleStatus={peopleStatus}
            setPeopleStatus={setPeopleStatus}
            locationOptions={locationOptions}
            locationVotes={locationVotes}
            adminChosenLocation={adminChosenLocation}
            setAdminChosenLocation={setAdminChosenLocation}
            chartedUsers={chartedUsers}
            setChartedUsers={setChartedUsers}
            calendarHeight={calendarHeight}
            participantToggleClicked={participantToggleClicked}
            setParticipantToggleClicked={setParticipantToggleClicked}
          />
        </div>

        {/* Left Calendar (Edit) - 2 columns */}
        <div className="col-span-2 flex flex-col">
          <div className="text-sm font-semibold text-center mb-2 text-gray-600 dark:text-gray-400">
            Your Availability
          </div>
          <div className="bg-white dark:bg-secondary_background-dark rounded-lg">
            <Calendar
              compactMode={true}
              theCalendarState={[
                timeSelectCalendarState,
                setTimeSelectCalendarState,
              ]}
              theCalendarFramework={[calendarFramework, setCalendarFramework]}
              chartedUsersData={undefined}
              draggable={true}
              user={getCurrentUserIndex()}
              isAdmin={false}
              theDragState={[leftDragState, setLeftDragState]}
              theGoogleCalendarEvents={[
                googleCalendarEvents,
                setGoogleCalendarEvents,
              ]}
              onClick={() => {}}
              theShowUserChart={undefined}
              isGeneralDays={isGeneralDays}
              setCalendarHeight={setCalendarHeight}
            />
          </div>
        </div>

        {/* Right Calendar (View) - 2 columns */}
        <div className="col-span-2 flex flex-col">
          <div className="text-sm font-semibold text-center mb-2 text-gray-600 dark:text-gray-400">
            Group Availability
          </div>
          <div className="bg-white dark:bg-secondary_background-dark rounded-lg">
            <Calendar
              compactMode={true}
              theCalendarState={[derivedGroupViewState, noop]}
              theCalendarFramework={[calendarFramework, setCalendarFramework]}
              chartedUsersData={[filteredChartedUsers, setChartedUsers]}
              draggable={false}
              user={getCurrentUserIndex()}
              isAdmin={true}
              theDragState={[rightDragState, setRightDragState]}
              theGoogleCalendarEvents={[[], noop]}
              onClick={() => {
                if (showUserChart === true) {
                  return;
                }
                setShowUserChart(true);
                setTimeout(() => setShowUserChart(false), 3000);
              }}
              theShowUserChart={[showUserChart, setShowUserChart]}
              isGeneralDays={false}
              setChartedUsers={setChartedUsers}
              chartedUsers={chartedUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

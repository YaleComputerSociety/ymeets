import { useState, useEffect, useCallback } from 'react';
import TimeSelectPage from '../TimeSelect/TimeSelectPage';
import ConditionalGroupViewRenderer from '../GroupView/ConditionalGroupViewRenderer';
import { SideBySideView } from '../SideBySideView';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import eventAPI from '../../backend/eventAPI';
import {
  getEventOnPageload,
  getEventName,
  getEventDescription,
  getLocationOptions,
  getAccountId,
  getLocationsVotes,
  getChosenLocation,
  getAccountName,
  getAvailabilityByAccountId,
  getAvailabilityByName,
  getChosenDayAndTime,
  wrappedSaveParticipantDetails,
  getParticipantIndex,
  checkIfAdmin,
} from '../../backend/events';
import {
  calanderState,
  userData,
  calendarDimensions,
  Availability,
} from '../../types';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import { calendar_v3 } from 'googleapis';

export default function UnifiedAvailabilityPage() {
  const location = useLocation();
  const { code } = useParams();

  const initialMode = location.state?.isEditing ?? false;
  const [isEditing, setIsEditing] = useState(initialMode);

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Google Calendar events for side-by-side view
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<
    calendar_v3.Schema$Event[]
  >([]);

  // Google Calendar list for sidebar
  const [googleCalendars, setGoogleCalendars] = useState<
    { id: string; summary: string; primary?: boolean }[]
  >([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);

  // groupview states
  const [groupViewCalendarState, setGroupViewCalendarState] =
    useState<calanderState>([]);
  const [groupViewCalendarFramework, setGroupViewCalendarFramework] =
    useState<calendarDimensions>({
      dates: [],
      startTime: new Date(),
      endTime: new Date(),
      numOfBlocks: 0,
      numOfCols: 0,
      timezone: getUserTimezone(),
    });
  const [chartedUsers, setChartedUsers] = useState<userData>({} as userData);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [locationOptions, setLocationOptions] = useState(Array<string>);
  const [allPeople, setAllPeople] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<userData>({} as userData);
  const [peopleStatus, setPeopleStatus] = useState<{
    [key: string]: boolean;
  }>({});
  useEffect(() => {
    setPeopleStatus(Object.fromEntries(allPeople?.map((name) => [name, true])));
  }, [allPeople]);
  const [userHasFilled, setUserHasFilled] = useState(false);
  const [locationVotes, setLocationVotes] = useState(Object);
  const [adminChosenLocation, setAdminChosenLocation] = useState<
    string | undefined
  >(undefined);

  // time select states
  const [timeSelectCalendarState, setTimeSelectCalendarState] =
    useState<calanderState>([]);
  const [timeSelectCalendarFramework, setTimeSelectCalendarFramework] =
    useState<calendarDimensions>({
      dates: [],
      startTime: new Date(),
      endTime: new Date(),
      numOfBlocks: 0,
      numOfCols: 0,
      timezone: getUserTimezone(),
    });
  const [hasAvailability, setHasAvailability] = useState(false);
  const [isGeneralDays, setIsGeneralDays] = useState(
    timeSelectCalendarFramework?.dates?.[0]?.[0]?.date?.getFullYear() === 2000
  );
  const [areSelectingGeneralDays, setAreSelectingGeneralDays] = useState(false);
  const [promptUserForLogin, setPromptUserForLogin] = useState(false);

  const nav = useNavigate();

  // Get current user index for saving
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

  // Save handler for side-by-side view
  const handleSideBySideSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const user = getCurrentUserIndex();
      const avail: Availability = timeSelectCalendarState
        ? (timeSelectCalendarState[user] ?? [])
        : [];
      await wrappedSaveParticipantDetails(avail, []);
      // Refresh data after save
      await fetchData(false);
    } finally {
      setIsSaving(false);
    }
  }, [timeSelectCalendarState, getCurrentUserIndex]);

  const fetchData = async (
    setLoadingState: boolean = true,
    onSuccess?: () => void
  ) => {
    if (setLoadingState) {
      setLoading(true);
    }

    if (code && code.length === 6) {
      await getEventOnPageload(code)
        .then(() => {
          // groupview
          const { availabilities, participants } = eventAPI.getCalendar();
          const dim = eventAPI.getCalendarDimensions();

          setChartedUsers({
            ...participants,
            available: [],
            unavailable: participants.users,
          });
          setAllPeople(participants.users.map((user) => user.name));
          setAllUsers(participants);
          setPeopleStatus(
            Object.fromEntries(
              participants.users.map((user) => [user.name, true])
            )
          );

          setUserHasFilled(participants.userIDs.includes(getAccountId()));

          setGroupViewCalendarState(availabilities);
          setGroupViewCalendarFramework(dim);

          setEventName(getEventName());
          setEventDescription(getEventDescription());
          setLocationVotes(getLocationsVotes());
          setLocationOptions(getLocationOptions());
          setAdminChosenLocation(getChosenLocation());
          setIsAdmin(checkIfAdmin());

          // time select
          const accountName = getAccountName();
          if (accountName === null) {
            return;
          }

          // Prefer the saved availability from the event if it exists.
          // Only append a row if the current user has no saved availability yet.
          let avail: Availability | undefined =
            getAccountId() !== ''
              ? getAvailabilityByAccountId(getAccountId())
              : getAvailabilityByName(accountName);
          const currentUserId = getAccountId();
          const hasSavedRowById =
            currentUserId && participants.userIDs.includes(currentUserId);
          const hasSavedRowByName =
            !!accountName &&
            (participants.users || []).some((u) => u.name === accountName);
          const hasSavedRow = Boolean(hasSavedRowById || hasSavedRowByName);

          const theRange = getChosenDayAndTime();
          setIsGeneralDays(
            dim?.dates[0][0].date?.getFullYear() === 2000 &&
              theRange === undefined
          );

          // If user already has a saved availability row, use the backend-provided matrix as-is.
          // Otherwise, append an empty row to allow first-time entry.
          if (hasSavedRow) {
            setHasAvailability(true);
            setTimeSelectCalendarState(availabilities);
          } else {
            if (avail === undefined) {
              avail = eventAPI.getEmptyAvailability(dim);
            } else {
              setHasAvailability(true);
            }
            setTimeSelectCalendarState([...availabilities, avail]);
          }
          setTimeSelectCalendarFramework(dim);

          /* The first date having a year be 2000 means that it was a general days selection */
          setAreSelectingGeneralDays(
            dim?.dates[0][0].date?.getFullYear() === 2000 &&
              theRange === undefined
          );

          // if there's a selection already made, nav to groupview since you're not allowed to edit your avail
          if (theRange !== undefined && theRange[0].getFullYear() !== 1970) {
            nav('/dashboard/' + code);
          }

          if (onSuccess) {
            onSuccess();
          }
        })
        .catch((err) => {
          console.error('Failed to load event:', err);
          nav('/notfound');
        });

      if (setLoadingState) {
        setLoading(false);
      }
    } else {
      // URL is malformed
      nav('/notfound');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60%] flex flex-col items-center justify-center">
        <LoadingAnim />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop: Side-by-side view */}
      <div className="hidden lg:block">
        <SideBySideView
          timeSelectCalendarState={timeSelectCalendarState}
          setTimeSelectCalendarState={setTimeSelectCalendarState}
          groupViewCalendarState={groupViewCalendarState}
          calendarFramework={timeSelectCalendarFramework}
          setCalendarFramework={setTimeSelectCalendarFramework}
          chartedUsers={chartedUsers}
          setChartedUsers={setChartedUsers}
          allPeople={allPeople}
          allUsers={allUsers}
          peopleStatus={peopleStatus}
          setPeopleStatus={setPeopleStatus}
          eventName={eventName}
          eventDescription={eventDescription}
          locationOptions={locationOptions}
          locationVotes={locationVotes}
          adminChosenLocation={adminChosenLocation}
          setAdminChosenLocation={setAdminChosenLocation}
          code={code}
          isAdmin={isAdmin}
          isGeneralDays={isGeneralDays}
          googleCalendarEvents={googleCalendarEvents}
          setGoogleCalendarEvents={setGoogleCalendarEvents}
          googleCalendars={googleCalendars}
          setGoogleCalendars={setGoogleCalendars}
          selectedCalendarIds={selectedCalendarIds}
          setSelectedCalendarIds={setSelectedCalendarIds}
          onSave={handleSideBySideSave}
          isSaving={isSaving}
        />
      </div>

      {/* Mobile: Current behavior (toggle between edit/view) */}
      <div className="lg:hidden">
        {isEditing ? (
          <TimeSelectPage
            isEditing={isEditing}
            toggleEditing={() => {
              setIsEditing(false);
              fetchData(false);
            }}
            onFetchComplete={() => {
              if (getAccountName() === '' || getAccountName() === undefined) {
                setPromptUserForLogin(true);
              }
            }}
            code={code}
            chartedUsers={chartedUsers}
            setChartedUsers={setChartedUsers}
            calendarState={timeSelectCalendarState}
            setCalendarState={setTimeSelectCalendarState}
            calendarFramework={timeSelectCalendarFramework}
            setCalendarFramework={setTimeSelectCalendarFramework}
            loading={loading}
            setLoading={setLoading}
            eventName={eventName}
            setEventName={setEventName}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            locationOptions={locationOptions}
            setLocationOptions={setLocationOptions}
            areSelectingGeneralDays={areSelectingGeneralDays}
            setAreSelectingGeneralDays={setAreSelectingGeneralDays}
            isGeneralDays={isGeneralDays}
            setIsGeneralDays={setIsGeneralDays}
            hasAvailability={hasAvailability}
            setHasAvailability={setHasAvailability}
          />
        ) : (
          <ConditionalGroupViewRenderer
            isEditing={isEditing}
            toggleEditing={() => {
              setIsEditing(true);
              fetchData(false);
            }}
            calendarState={groupViewCalendarState}
            setCalendarState={setGroupViewCalendarState}
            calendarFramework={groupViewCalendarFramework}
            setCalendarFramework={setGroupViewCalendarFramework}
            code={code}
            chartedUsers={chartedUsers}
            setChartedUsers={setChartedUsers}
            eventName={eventName}
            setEventName={setEventName}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            locationVotes={locationVotes}
            setLocationVotes={setLocationVotes}
            locationOptions={locationOptions}
            setLocationOptions={setLocationOptions}
            adminChosenLocation={adminChosenLocation}
            setAdminChosenLocation={setAdminChosenLocation}
            loading={loading}
            setLoading={setLoading}
            allPeople={allPeople}
            setAllPeople={setAllPeople}
            peopleStatus={peopleStatus}
            setPeopleStatus={setPeopleStatus}
            allUsers={allUsers}
            setAllUsers={setAllUsers}
            userHasFilled={userHasFilled}
            setUserHasFilled={setUserHasFilled}
          />
        )}
      </div>
    </div>
  );
}

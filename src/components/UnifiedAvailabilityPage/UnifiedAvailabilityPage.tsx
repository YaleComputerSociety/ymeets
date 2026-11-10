import { useState, useEffect, useCallback, useRef } from 'react';
import TimeSelectPage from '../TimeSelect/TimeSelectPage';
import ConditionalGroupViewRenderer from '../GroupView/ConditionalGroupViewRenderer';
import { SideBySideView } from '../SideBySideView';
import {
  NavigationType,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
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
  workingEvent,
  wrappedSaveDeclinedParticipantDetails
} from '../../backend/events';
import { notifyAdminOfNewResponse } from '../../emails/sendEmailHelpers';
import {
  calendarState,
  userData,
  calendarDimensions,
  Availability,
} from '../../types';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import UnsavedChangesPopup from '../utils/components/UnsavedChangesPopup';
import { shouldSkipUnsavedChangesPrompt } from '../utils/functions/navigationState';
import { getUserTimezone } from '../utils/functions/timzoneConversions';
import { calendar_v3 } from 'googleapis';

// Track events where we've already sent a notification this session
// to avoid spamming the admin with repeated emails when a user saves multiple times
const notifiedEventsThisSession = new Set<string>();

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

  // User's preferred locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Track unsaved changes for save button visibility
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // User signed-in state - check if user has a name (either from Google or manual entry)
  const [userHasSignedIn, setUserHasSignedIn] = useState(() => {
    return getAccountName() !== '';
  });

  // groupview states
  const [groupViewCalendarState, setGroupViewCalendarState] =
    useState<calendarState>([]);
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
  const [declinedPeople, setDeclinedPeople] = useState<string[]>([]);
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
    useState<calendarState>([]);
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
      await wrappedSaveParticipantDetails(avail, selectedLocations);

      // Email event admin if they opted in (only once per session to avoid spam)
      const eventId = workingEvent.publicId;
      if (
        workingEvent.details.emailAdmin === true &&
        !notifiedEventsThisSession.has(eventId)
      ) {
        notifyAdminOfNewResponse(
          workingEvent.details.adminAccountId,
          getAccountId(),
          getAccountName(),
          workingEvent.details.name,
          eventId
        );
        notifiedEventsThisSession.add(eventId);
      }

      // Refresh data after save
      await fetchData(false);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [timeSelectCalendarState, getCurrentUserIndex, selectedLocations]);

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
          setDeclinedPeople(
            workingEvent.participants
              .filter((p) => p.declined === true)
              .map((p) => p.name)
          );

          setAllUsers(participants);
          setPeopleStatus(
            Object.fromEntries(
              participants.users.map((user) => [user.name, true])
            )
          );

          setUserHasFilled(participants.userIDs.includes(getAccountId()));

          // Deep copy to prevent shared references with timeSelectCalendarState
          setGroupViewCalendarState(JSON.parse(JSON.stringify(availabilities)));
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

  /**
   * Serializes what the user has actually chosen: the selected cells of their
   * availability and their desktop locations. Comparing selected cells rather
   * than raw arrays matters because dragging can add `false` entries or holes
   * (e.g. cells the stored arrays didn't have yet), which look identical on screen.
   */
  const getEditableSnapshot = () => {
    const availability = timeSelectCalendarState?.[getCurrentUserIndex()];
    const selectedCells: string[] = [];
    Object.entries(availability ?? {}).forEach(([col, blocks]) => {
      Object.entries(blocks ?? {}).forEach(([block, isSelected]) => {
        if (isSelected === true) selectedCells.push(`${col}-${block}`);
      });
    });
    return JSON.stringify({
      selectedCells,
      locations: [...selectedLocations].sort(),
    });
  };

  // Snapshot of the last loaded or saved state. Whenever the unsaved flag is
  // clear, the state on screen is what's in Firestore, so record it then.
  // Stored as a string because CalBlock mutates availability arrays in place.
  const savedSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hasUnsavedChanges) savedSnapshotRef.current = getEditableSnapshot();
  }, [hasUnsavedChanges, timeSelectCalendarState, selectedLocations]);

  // Mobile location and calendar choices live inside TimeSelectPage, so they
  // can't be compared here; any change to them counts as unsaved
  const mobileSettingsEditedRef = useRef(false);

  /**
   * Whether there's anything worth prompting about: an edit was made and it
   * didn't end up back at the saved state (e.g. selecting times, then
   * unselecting them all).
   */
  const hasMeaningfulUnsavedChanges = () =>
    hasUnsavedChanges &&
    (mobileSettingsEditedRef.current ||
      getEditableSnapshot() !== savedSnapshotRef.current);

  // Browser-level warning for closing the tab, refreshing, or leaving the site
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasMeaningfulUnsavedChangesRef.current()) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // The beforeunload listener outlives renders, so it reads the latest check through a ref
  const hasMeaningfulUnsavedChangesRef = useRef(hasMeaningfulUnsavedChanges);
  hasMeaningfulUnsavedChangesRef.current = hasMeaningfulUnsavedChanges;

  // In-app navigation guard (navbar links, nav() calls, back/forward within the app)
  // The skip marker only counts for the navigation that set it. History entries keep
  // their state, so Back/Forward (POP) onto a page reached by a decline/delete still
  // carries the marker and must not skip the prompt.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation, historyAction }) =>
      hasMeaningfulUnsavedChanges() &&
      currentLocation.pathname !== nextLocation.pathname &&
      !(
        historyAction !== NavigationType.Pop &&
        shouldSkipUnsavedChangesPrompt(nextLocation.state)
      )
  );
  const [leaveSaveError, setLeaveSaveError] = useState<string | undefined>();

  // Mobile: switching from editing to viewing reloads availability, so it's guarded too
  const [pendingViewSwitch, setPendingViewSwitch] = useState(false);
  const mobileSaveRef = useRef<(() => Promise<void>) | null>(null);
  const [isSavingFromPopup, setIsSavingFromPopup] = useState(false);
  // Mobile's own Save button runs outside the popup, so track it separately
  const [isSavingMobile, setIsSavingMobile] = useState(false);

  // Whether the unsaved edits came from the mobile editor, which keeps its own
  // locations and calendar selection, so the popup knows which save to run
  const mobileHasEditsRef = useRef(false);

  /** Marks unsaved changes made in the mobile editor. Stable, since TimeSelectPage's drag setter depends on it. */
  const setMobileHasUnsavedChanges = useCallback((value: boolean) => {
    mobileHasEditsRef.current = value;
    setHasUnsavedChanges(value);
  }, []);

  /** Records a mobile location or calendar change, which always counts as unsaved. */
  const markMobileSettingsEdited = useCallback(() => {
    mobileSettingsEditedRef.current = true;
  }, []);

  // Any save (desktop or mobile) that clears the flag also clears mobile's edits
  useEffect(() => {
    if (!hasUnsavedChanges) {
      mobileHasEditsRef.current = false;
      mobileSettingsEditedRef.current = false;
    }
  }, [hasUnsavedChanges]);
  const isUnsavedChangesPopupOpen =
    blocker.state === 'blocked' || pendingViewSwitch;

  // Don't carry a previous attempt's save error into a newly opened popup
  useEffect(() => {
    if (isUnsavedChangesPopupOpen) setLeaveSaveError(undefined);
  }, [isUnsavedChangesPopupOpen]);

  /** Leaves mobile edit mode and reloads availability, without any guard. */
  const exitMobileEditing = () => {
    setIsEditing(false);
    fetchData(false);
  };

  /** Leaves mobile edit mode, asking first if there are unsaved changes. */
  const requestExitMobileEditing = () => {
    if (hasMeaningfulUnsavedChanges()) {
      setPendingViewSwitch(true);
    } else {
      // Edits that ended back at the saved state need no prompt; clear the flag
      // so it doesn't linger after the reload
      setHasUnsavedChanges(false);
      exitMobileEditing();
    }
  };

  /**
   * Saves the side-by-side edits without reloading. Unlike handleSideBySideSave,
   * this never calls fetchData, which can navigate and reset the blocker
   * before the popup gets to proceed.
   */
  const persistSideBySideChanges = async () => {
    const user = getCurrentUserIndex();
    const avail: Availability = timeSelectCalendarState
      ? (timeSelectCalendarState[user] ?? [])
      : [];
    await wrappedSaveParticipantDetails(avail, selectedLocations);

    // Email event admin if they opted in (only once per session to avoid spam)
    const eventId = workingEvent.publicId;
    if (
      workingEvent.details.emailAdmin === true &&
      !notifiedEventsThisSession.has(eventId)
    ) {
      notifyAdminOfNewResponse(
        workingEvent.details.adminAccountId,
        getAccountId(),
        getAccountName(),
        workingEvent.details.name,
        eventId
      );
      notifiedEventsThisSession.add(eventId);
    }

    setHasUnsavedChanges(false);
  };

  /**
   * Saves through whichever editor made the edits. Chosen by where the edits
   * came from, not viewport width, since resizing can switch the visible layout.
   */
  const saveUnsavedChanges = async () => {
    setIsSavingFromPopup(true);
    try {
      if (mobileHasEditsRef.current && isEditing && mobileSaveRef.current) {
        await mobileSaveRef.current();
      } else {
        await persistSideBySideChanges();
      }
    } finally {
      setIsSavingFromPopup(false);
    }
  };

  /** Completes whatever the popup interrupted: the mobile view switch or the blocked navigation. */
  const finishPendingAction = () => {
    if (pendingViewSwitch) {
      setPendingViewSwitch(false);
      exitMobileEditing();
    } else if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  // Set while the popup's own save runs, so the auto-continue effect below
  // doesn't also finish the pending action (proceeding twice throws)
  const isPopupSaveRunningRef = useRef(false);

  /** Popup "Save & leave/view": saves, then continues; on failure stays and shows an error. */
  const handleSaveAndLeave = async () => {
    setLeaveSaveError(undefined);
    isPopupSaveRunningRef.current = true;
    try {
      await saveUnsavedChanges();
      finishPendingAction();
    } catch (err) {
      console.error('Failed to save before leaving:', err);
      setLeaveSaveError('Failed to save your changes. Please try again.');
    } finally {
      isPopupSaveRunningRef.current = false;
    }
  };

  /** Popup "Discard": continues without saving; unmounting or the reload drops the edits. */
  const handleLeaveWithoutSaving = () => {
    setLeaveSaveError(undefined);
    if (pendingViewSwitch) setHasUnsavedChanges(false);
    finishPendingAction();
  };

  /** Popup "Stay": cancels the pending view switch or navigation. */
  const handleStay = () => {
    setLeaveSaveError(undefined);
    if (pendingViewSwitch) {
      setPendingViewSwitch(false);
    } else if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  // If a save started outside the popup (e.g. clicking Save, then a link)
  // finishes with nothing left unsaved, carry on instead of asking again
  const isAnySaveInFlight = isSaving || isSavingFromPopup || isSavingMobile;
  useEffect(() => {
    if (
      isUnsavedChangesPopupOpen &&
      !hasUnsavedChanges &&
      !isAnySaveInFlight &&
      !isPopupSaveRunningRef.current
    ) {
      finishPendingAction();
    }
  }, [isUnsavedChangesPopupOpen, hasUnsavedChanges, isAnySaveInFlight]);

  const unsavedChangesPopup = (
    <UnsavedChangesPopup
      isOpen={isUnsavedChangesPopupOpen}
      isSaving={isAnySaveInFlight}
      error={leaveSaveError}
      saveText={pendingViewSwitch ? 'Save & view' : 'Save & leave'}
      onSaveAndLeave={handleSaveAndLeave}
      onLeave={handleLeaveWithoutSaving}
      onStay={handleStay}
    />
  );

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
      {unsavedChangesPopup}

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
          declinedPeople={declinedPeople}
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
          selectedLocations={selectedLocations}
          setSelectedLocations={setSelectedLocations}
          userHasSignedIn={userHasSignedIn}
          setUserHasSignedIn={setUserHasSignedIn}
          onSave={handleSideBySideSave}
          onDecline={() => fetchData(false)}
          isSaving={isSaving}
          userHasFilled={userHasFilled}
          hasUnsavedChanges={hasUnsavedChanges}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      </div>

      {/* Mobile: Current behavior (toggle between edit/view) */}
      <div className="lg:hidden">
        {isEditing ? (
          <TimeSelectPage
            isEditing={isEditing}
            toggleEditing={requestExitMobileEditing}
            onSaveComplete={exitMobileEditing}
            setHasUnsavedChanges={setMobileHasUnsavedChanges}
            onSavingChange={setIsSavingMobile}
            onSettingsEdited={markMobileSettingsEdited}
            saveRef={mobileSaveRef}
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
            declinedPeople={declinedPeople}
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

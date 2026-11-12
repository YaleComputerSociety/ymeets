import {
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  CollectionReference,
  DocumentData,
  getDocs,
  Timestamp,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import {
  Availability,
  Event,
  Location,
  EventDetails,
  EventId,
  Participant,
  computeLiteExpiry,
} from '../types';
import { auth, db } from './firebase';
import { generateTimeBlocks } from '../components/utils/functions/generateTimeBlocks';
import { runTransaction } from 'firebase/firestore';
import { doTimezoneChange } from '../components/utils/functions/timzoneConversions';
import { getUserTimezone } from '../components/utils/functions/timzoneConversions';
import { AccountsPageEvent } from '../components/Accounts/AccountsPage';
import {
  removeCachedAccountEvent,
  upsertCachedAccountEvent,
} from '../components/Accounts/accountEventsCache';
// ASSUME names are unique within an event

let workingEvent: Event = {
  publicId: 'ABABAB',
  details: {
    name: 'name',
    adminName: 'string',
    description: 'description',
    adminAccountId: 'WJCCE0YA2fY5gpPxG58l8Ax3T9m2',
    dates: [],
    startTime: new Date(), // minutes; min: 0, max 24*60 = 1440
    endTime: new Date(), // minutes; min: 0, max 24*60 = 1440
    plausibleLocations: ['HH17', 'Sterling'],
    timeZone: 'America/New_York',
    participants: [],
    dateCreated: new Date(),
  },
  participants: [],
};

const checkIfLoggedIn = (): boolean => {
  return (auth.currentUser && !auth.currentUser.isAnonymous) || false;
};

const checkIfAdmin = (): boolean => {
  if (workingEvent && auth.currentUser) {
    if (
      workingEvent.details.adminAccountId &&
      workingEvent.details.adminAccountId == getAccountId()
    ) {
      return true;
    }
  }
  return false;
};

// Lite events have no admin and expire; see `EventMode`
const isLiteEvent = (): boolean => {
  return workingEvent?.details.mode === 'lite';
};

const getExpireAt = (): Date | undefined => {
  return workingEvent?.expireAt;
};

/**
 *
 * @returns Account ID, if and only if the user is not anonymously logged in.
 */
const getAccountId = (): string => {
  if (auth.currentUser !== null && !auth.currentUser.isAnonymous) {
    return auth.currentUser.uid;
  } else {
    return '';
  }
};

const getAccountName = (): string => {
  return auth.currentUser?.displayName ? auth.currentUser.displayName : '';
};

const getAccountEmail = (): string => {
  return auth.currentUser?.email ? auth.currentUser.email : '';
};

async function generateUniqueEventKey(): Promise<string> {
  let uniqueKeyFound = false;
  let newKey = '';

  while (!uniqueKeyFound) {
    newKey = doc(collection(db, 'events')).id.substring(0, 6).toUpperCase();
    const docRef = doc(db, 'events', newKey);
    const existingDoc = await getDoc(docRef);

    if (!existingDoc.exists()) {
      // possible race conditions (with this along with previous iteration)
      uniqueKeyFound = true;
    }
  }

  return newKey;
}

// PURPOSE: Internal use and to check if event of id exists.
// Retreives an event from the backend given the id
// Will throw an error if the document cannot be found
// Event is not return; rather, it is stored internally
// for other getters and settings defined in this file.
async function getEventById(id: EventId): Promise<void> {
  const eventsRef = collection(db, 'events');
  await new Promise<void>((resolve, reject) => {
    getDoc(doc(eventsRef, id))
      .then(async (result) => {
        if (result.exists()) {
          workingEvent = result.data() as Event;
          workingEvent.details.startTime = workingEvent.details.startTime
            ? (workingEvent.details.startTime as unknown as Timestamp).toDate()
            : workingEvent.details.startTime;
          workingEvent.details.endTime = workingEvent.details.endTime
            ? (workingEvent.details.endTime as unknown as Timestamp).toDate()
            : workingEvent.details.endTime;
          workingEvent.details.chosenStartDate = workingEvent.details
            .chosenStartDate
            ? (
                workingEvent.details.chosenStartDate as unknown as Timestamp
              ).toDate()
            : workingEvent.details.chosenStartDate;
          workingEvent.details.chosenEndDate = workingEvent.details
            .chosenEndDate
            ? (
                workingEvent.details.chosenEndDate as unknown as Timestamp
              ).toDate()
            : workingEvent.details.chosenEndDate;
          workingEvent.details.dates = dateToArray(workingEvent.details.dates);
          workingEvent.expireAt = workingEvent.expireAt
            ? (workingEvent.expireAt as unknown as Timestamp).toDate()
            : workingEvent.expireAt;

          // Retrieve all participants as sub-collection
          await getParticipants(collection(db, 'events', id, 'participants'))
            .then((parts) => {
              workingEvent.participants = parts;
            })
            .catch((err) => {
              reject(err);
            });

          workingEvent.details.participants = workingEvent.participants
            .filter((part) => part.accountId !== undefined)
            .map((part) => part.accountId!);

          resolve();
        } else {
          console.error('[events.getEventById] Event not found', id);
          reject('Document not found');
        }
      })
      .catch((err) => {
        console.error('Caught ' + err + ' with message ' + err.msg);
        reject(err);
      });
  });
}

async function deleteEvent(id: EventId): Promise<void> {
  // Prevent any user other than the admin to delete event
  if (
    getAccountId() !==
    ((await getDoc(doc(db, 'events', id))).data() as unknown as Event).details
      .adminAccountId
  ) {
    throw Error('Only creator can delete event');
  }

  // Get a new write batch
  const batch = writeBatch(db);

  // Add each participant doc in the subcollection
  const participants = await getDocs(
    collection(db, 'events', id, 'participants')
  );

  participants.forEach((data) => {
    batch.delete(doc(db, 'events', id, 'participants', data.id));
  });

  // delete the event itself
  batch.delete(doc(db, 'events', id));

  // Commit the batch
  await batch.commit().catch((err) => {
    console.error('Error: ', err);
  });

  removeEventFromUserCollection(getAccountId(), id);
  // Keep local account events cache in sync (Accounts page).
  const accountId = getAccountId();
  if (accountId) {
    removeCachedAccountEvent(accountId, id);
  }
}

// Structure of the userEvents array in the user document
interface UserEvent {
  code: string;
  lastModified: Date | Timestamp;
  dateCreated: Date | Timestamp;
  isAdmin: boolean;
}

async function removeEventFromUserCollection(
  userID: string,
  eventCode: string
) {
  const userRef = doc(db, 'users', userID);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.warn('User document not found: User does not exist in the database');
    return;
  }

  const userData = userDoc.data();
  const userEvents: UserEvent[] = userData.userEvents || [];

  const updatedEvents = userEvents.filter((event) => event.code !== eventCode);

  await updateDoc(userRef, {
    userEvents: updatedEvents,
  }).catch((err) => {
    console.error('Error updating user document:', err);
  });
}

// returns array of
async function getParsedAccountPageEventsForUser(
  accountID: string
): Promise<AccountsPageEvent[]> {
  // get event ids and lastModified info
  const userRef = doc(db, 'users', accountID);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.warn('User document not found: User does not exist in the database');
    return [];
  }

  const userData = userDoc.data();
  const userEvents: UserEvent[] = userData.userEvents || [];

  const eventCodes = userEvents.map((event) => event.code);
  const lastModified = userEvents.map((event) => event.lastModified);
  const dateCreated = userEvents.map((event) => event.dateCreated);

  const accountPageEvents: AccountsPageEvent[] = [];

  const eventsRef = collection(db, 'events');

  for (const eventCode of eventCodes) {
    const eventDoc = await getDoc(doc(eventsRef, eventCode));
    if (eventDoc.exists()) {
      const event = eventDoc.data();
      const eventIndex = eventCodes.indexOf(eventCode);

      // Safely handle dateCreated - prefer userEvents array, fallback to event document, then current date
      let dateCreatedDate: Date;
      const dateCreatedValue =
        eventIndex >= 0 ? dateCreated[eventIndex] : undefined;

      if (dateCreatedValue) {
        // Use dateCreated from userEvents array (most reliable)
        if (dateCreatedValue instanceof Date) {
          dateCreatedDate = dateCreatedValue;
        } else {
          dateCreatedDate = (dateCreatedValue as unknown as Timestamp).toDate();
        }
      } else if (event.details.dateCreated) {
        // Fallback to event document if userEvents doesn't have it
        if (event.details.dateCreated instanceof Date) {
          dateCreatedDate = event.details.dateCreated;
        } else {
          dateCreatedDate = (
            event.details.dateCreated as unknown as Timestamp
          ).toDate();
        }
      } else {
        // Last resort: current date (should rarely happen)
        console.warn(
          `No dateCreated found for event ${eventCode}, using current date`
        );
        dateCreatedDate = new Date();
      }

      // Safely handle lastModified - might be undefined or missing
      const lastModifiedValue =
        eventIndex >= 0 ? lastModified[eventIndex] : undefined;
      let lastModifiedDate: Date;
      if (!lastModifiedValue) {
        lastModifiedDate = new Date(); // Fallback to current date if missing
      } else if (lastModifiedValue instanceof Date) {
        lastModifiedDate = lastModifiedValue;
      } else {
        lastModifiedDate = lastModifiedValue.toDate();
      }

      accountPageEvents.push({
        name: event.details.name,
        id: event.publicId,
        dates: event.details.chosenStartDate
          ? event.details.chosenStartDate?.toLocaleDateString()
          : 'TBD',
        startTime: event.details.chosenStartDate
          ? event.details.chosenStartDate?.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'TBD',
        endTime: event.details.chosenEndDate
          ? event.details.chosenEndDate?.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'TBD',
        location: event.details.chosenLocation || 'TBD',
        iAmCreator: event.details.adminAccountId === getAccountId(),
        dateCreated: dateCreatedDate,
        lastModified: lastModifiedDate,
      });
    } else {
      // won't load if it doesn't exist (has been deleted by admin)
      removeEventFromUserCollection(accountID, eventCode);
    }
  }

  return accountPageEvents;
}

// Stores a new event passed in as a parameter to the backend
async function createEvent(eventDetails: EventDetails): Promise<Event | null> {
  const id = await generateUniqueEventKey();
  const newEvent: Event = {
    details: {
      ...eventDetails,
      // TODO map dates to JSON
      dates: eventDetails.dates,
    },
    publicId: id,
    participants: [],
  };

  if (eventDetails.mode === 'lite') {
    newEvent.expireAt = computeLiteExpiry(
      eventDetails.dates,
      eventDetails.dateCreated
    );
  }

  // Update local copy
  workingEvent = newEvent;

  // Lite events have no admin, so there's no user document to add the event to
  if (eventDetails.mode === 'lite') {
    await setDoc(doc(collection(db, 'events'), id), newEvent);
    return newEvent;
  }

  // Update backend
  return await new Promise((resolve, reject) => {
    // Add event to events collection
    const eventsRef = collection(db, 'events');
    setDoc(doc(eventsRef, id), {
      ...newEvent,
      participants: [eventDetails.adminAccountId],
    })
      .then(() => {
        // Add event to admin user's events field
        const userRef = doc(db, 'users', eventDetails.adminAccountId); // Reference to the user's document
        const eventDetailsForUser = {
          code: id, // Using event ID as the event code
          lastModified: new Date(), // Timestamp when the event is added
          dateCreated: new Date(),
          isAdmin: true, // Admin status for this event
        };
        updateDoc(userRef, {
          userEvents: arrayUnion(eventDetailsForUser),
        })
          .then(() => {
            const row: AccountsPageEvent = {
              name: eventDetails.name,
              id,
              dates: 'TBD',
              startTime: 'TBD',
              endTime: 'TBD',
              location: 'TBD',
              iAmCreator: true,
              dateCreated: new Date(),
              lastModified: new Date(),
            };
            upsertCachedAccountEvent(eventDetails.adminAccountId, row);
            resolve(newEvent);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// For internal use
// Returns undefined when participant has not been added yet
const getParticipantIndex = (
  name: string,
  accountId: string = ''
): number | undefined => {
  let index;
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (
      (accountId === '' && workingEvent.participants[i].name == name) ||
      (accountId !== '' && workingEvent.participants[i].accountId == accountId)
    ) {
      index = i;
    }
  }
  return index;
};

// For internal use
const getParticipants = async (
  reference: CollectionReference<DocumentData>
): Promise<Participant[]> => {
  return await new Promise((resolve, reject) => {
    getDocs(reference)
      .then((docs) => {
        const parts: Participant[] = [];
        docs.forEach((data) => {
          // unstringify availability
          const participant = data.data();
          participant.availability = JSON.parse(participant.availability);

          parts.push(participant as Participant);
        });

        resolve(parts);
      })
      .catch((err) => {
        console.error('Caught ' + err + ' with message ' + err.msg);
        reject(err);
      });
  });
};

async function updateUserCollectionEventsWith(accountId: string) {
  const userRef = doc(db, 'users', accountId);
  const eventCode = workingEvent.publicId;
  const now = new Date();

  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists()) {
      throw new Error(`User document ${accountId} does not exist`);
    }

    const data = snap.data();
    const userEvents: UserEvent[] = data.userEvents || [];
    const existingIdx = userEvents.findIndex((ev) => ev.code === eventCode);

    // Update existing entry
    if (existingIdx !== -1) {
      const updatedEvents = [...userEvents];
      updatedEvents[existingIdx] = {
        ...updatedEvents[existingIdx],
        lastModified: now,
      };

      tx.update(userRef, { userEvents: updatedEvents });
      return;
    }

    // Add new entry if event not in userEvents
    const newEntry: UserEvent = {
      code: eventCode,
      lastModified: now,
      dateCreated: workingEvent.details.dateCreated || now,
      isAdmin: false,
    };

    tx.update(userRef, {
      userEvents: [...userEvents, newEntry],
    });
  });
}

// For internal use
// Updates the participants list of the working event
// with the participant passed in, overwriting if they already exist
async function saveParticipantDetails(participant: Participant, skipUserCollection = false): Promise<void> {
  participant.email = getAccountEmail();

  // Update local copy first
  let existingIndex = workingEvent.participants.findIndex(
    (part) =>
      (participant.accountId && part.accountId === participant.accountId) ||
      (!participant.accountId && part.name === participant.name)
  );

  if (existingIndex !== -1) {
    workingEvent.participants[existingIndex] = participant;
  } else {
    workingEvent.participants.push(participant);

    // Add new entry to event participants array
    const accountId = getAccountId();
    if (accountId) {
      await updateDoc(doc(db, 'events', workingEvent.publicId), {
        participants: arrayUnion(accountId),
      });
    }
  }

  // Always await — avoids race conditions
  // if this is a declined call, its can't update user collection with events or it overwrites event deletion
  const accountId = getAccountId();
  if (accountId && !skipUserCollection) {
    await updateUserCollectionEventsWith(accountId);
  }

  // Write participant subdoc
  const eventsRef = collection(db, 'events');
  const partRef = doc(
    doc(eventsRef, workingEvent.publicId),
    'participants',
    participant.accountId || participant.name
  );

  await setDoc(partRef, {
    name: participant.name,
    accountId: participant.accountId || '',
    email: getAccountEmail(),
    availability: JSON.stringify(participant.availability),
    location: participant.location || '',
    declined: participant.declined || false,
    // TTL doesn't delete subcollections, so lite participants expire alongside their event
    ...(workingEvent.expireAt ? { expireAt: workingEvent.expireAt } : {}),
  });
}


async function updateAnonymousUserToAuthUser(name: string) {
  const accountName = getAccountName();
  const accountId = getAccountId();

  try {
    if (accountName === '') throw new Error('User is not signed in');

    let availability: unknown;
    workingEvent.participants.forEach((part, index) => {
      if (part.name == name && part.accountId == '') {
        workingEvent.participants[index].name = accountName;
        workingEvent.participants[index].accountId = accountId;
        availability = workingEvent.participants[index].availability;
      }
    });

    if (availability === undefined) return;

    const eventsRef = collection(db, 'events');
    const eventDocRef = doc(eventsRef, workingEvent.publicId);
    const participantsRef = collection(eventDocRef, 'participants');
    const anonymousPartRef = doc(participantsRef, name);
    const authedPartRef = doc(participantsRef, accountId);

    await runTransaction(db, async (transaction) => {
      const anonymousDoc = await transaction.get(anonymousPartRef);

      if (!anonymousDoc.exists()) {
        console.warn('Anonymous document not found:', name);
        return;
      }

      transaction.set(authedPartRef, {
        name: accountName,
        email: getAccountEmail(),
        accountId,
        availability: JSON.stringify(availability),
        ...(workingEvent.expireAt ? { expireAt: workingEvent.expireAt } : {}),
      });

      transaction.update(eventDocRef, {
        participants: arrayUnion(accountId),
      });

      transaction.delete(anonymousPartRef);
    });

    console.log('User updated successfully');
    return;
  } catch (err) {
    console.error('Error in updating user:', err);
    throw err;
  }
}

async function wrappedSaveParticipantDetails(
  availability: Availability,
  locations: Location[] | undefined
): Promise<void> {
  let name = getAccountName();
  if (!name) {
    console.warn('User not signed in');
    name = 'John Doe';
  }

  // Pass availability as array - saveParticipantDetails will stringify it
  await saveParticipantDetails({
    name,
    accountId: getAccountId(),
    email: getAccountEmail(),
    availability: availability, // Pass as array, not stringified
    location: locations !== undefined ? locations : [],
    declined: false,
  });
}

async function wrappedSaveDeclinedParticipantDetails(): Promise<void> {
  let name = getAccountName();
  if (!name) {
    console.warn('User not signed in');
    name = 'John Doe';
  }

  // remove event from their firestore
  const accountId = getAccountId();
  await removeEventFromUserCollection(accountId, workingEvent.publicId);

  // skipUserCollection=true prevents re-adding the event to userEvents
  await saveParticipantDetails({
    name,
    accountId: getAccountId(),
    email: getAccountEmail(),
    availability: [], 
    location: [],
    declined: true,
  }, true);
}

// Retrieves the list of locations to be considered for the event
function getLocationOptions(): Location[] {
  return workingEvent.details.plausibleLocations;
}

// Retrieves the name of the event
function getEventName(): string {
  return workingEvent.details.name;
}

// Retrieves the description of the event
function getEventDescription(): string {
  return workingEvent.details.description;
}

// To be called on render when a page loads with event id in url
async function getEventOnPageload(id: string): Promise<void> {
  await getEventById(id.toUpperCase());
  return;
}

// Retrieves the availability object of the participant matching `name`
function getAvailabilityByName(name: string): Availability | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].name == name) {
      return parseAvail(workingEvent.participants[i].availability);
      // this arises because to store an availability object in Firestore, it must be stringified, but the frontend uses a JSON object
    }
  }
}

function parseAvail(val: unknown): Availability | undefined {
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) return val as Availability;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as Availability;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// Retrieves the availability object of the participant matching `accountId`
function getAvailabilityByAccountId(
  accountId: string
): Availability | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].accountId == accountId) {
      return parseAvail(workingEvent.participants[i].availability);
    }
  }
}

// Retrieves the list of participants
// GUARANTEED to be the in the same order as getAllAvailabilities
function getAllAvailabilitiesNames(): string[] {
  const names: string[] = [];
  for (let i = 0; i < workingEvent.participants.length; i++) {
    names.push(workingEvent.participants[i].name);
  }
  return names;
}

function getAllAvailabilitiesIDs(): string[] {
  const ids: string[] = [];
  for (let i = 0; i < workingEvent.details.participants.length; i++) {
    ids.push(workingEvent.details.participants[i]);
  }
  return ids;
}

// Retrieves the list of availabilities
// GUARANTEED to be the in the same order as getAllAvailabilitiesNames
function getAllAvailabilities(): Availability[] {
  const avails: Availability[] = [];

  const makeEmptyAvailability = (): Availability => {
    const timeBlocks = generateTimeBlocks(
      workingEvent.details.startTime,
      workingEvent.details.endTime
    );
    const blocksLength = timeBlocks.flat().flat().length;
    const numDates = getDates().length;
    const days: boolean[][] = [];
    for (let i = 0; i < numDates; i++) {
      days.push(Array.from({ length: blocksLength }, () => false));
    }
    return days;
  };

  for (let i = 0; i < workingEvent.participants.length; i++) {
    // availability may be string or already an array
    const val = workingEvent.participants[i].availability;
    if (Array.isArray(val)) {
      avails.push(val as Availability);
    } else if (typeof val === 'string') {
      try {
        avails.push(JSON.parse(val) as Availability);
      } catch {
        // if parsing fails, push an empty availability matching current framework
        avails.push(makeEmptyAvailability());
      }
    } else {
      avails.push(makeEmptyAvailability());
    }
  }
  return avails;
}

// Retrieves the official datetime (start and end) of the event as chosen by the admin
function getChosenDayAndTime(): [Date, Date] | undefined {
  if (
    workingEvent.details.chosenStartDate &&
    workingEvent.details.chosenEndDate
  ) {
    return [
      workingEvent.details.chosenStartDate,
      workingEvent.details.chosenEndDate,
    ];
  }
}

// Retrieves the official location of the event as chosen by the admin
function getChosenLocation(): Location | undefined {
  return workingEvent.details.chosenLocation;
}

// Retrieves the dict objects mapping locations (keys) to number of votes (items)
function getLocationsVotes(): Record<Location, number> | any {
  const votes: Record<Location, number> = {};
  for (let i = 0; i < workingEvent.details.plausibleLocations.length; i++) {
    const location = workingEvent.details.plausibleLocations[i];
    votes[location] = 0;
    for (let i = 0; i < workingEvent.participants.length; i++) {
      const participant = workingEvent.participants[i];
      if (participant.location.includes(location)) {
        votes[location] += 1;
      }
    }
  }
  return votes;
}

function getZoomLink(): string | undefined {
  return workingEvent.details.zoomLink || undefined;
}

function getUTCDates(): Date[] {
  return workingEvent.details.dates;
}

function getUTCStartAndEndTimes(): Date[] {
  return [workingEvent.details.startTime, workingEvent.details.endTime];
}

function getDates(): Date[] {
  const { timeZone, startTime, endTime } = workingEvent.details;
  let dates = workingEvent.details.dates;
  const userTimeZone = getUserTimezone();
  if (timeZone == userTimeZone) {
    return dates;
  }

  const { adjustedDates } = doTimezoneChange(userTimeZone, startTime, endTime);

  return adjustedDates;
}

function getStartAndEndTimes(): Date[] {
  let startTime = workingEvent.details.startTime;
  let endTime = workingEvent.details.endTime;
  let userTimeZone = getUserTimezone();

  if (workingEvent.details.timeZone == userTimeZone) {
    return [startTime, endTime];
  }

  const { adjustedStartTime, adjustedEndTime } = doTimezoneChange(
    userTimeZone,
    startTime,
    endTime
  );

  return [adjustedStartTime, adjustedEndTime];
}

function getTimezone(): string {
  return workingEvent.details.timeZone;
}

function getEventObjectForGCal(
  startDate: Date,
  endDate: Date,
  location?: string
) {
  return {
    summary: workingEvent.details.name,
    location: location == undefined ? '' : location,
    description: workingEvent.details.description,
    start: {
      dateTime: startDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: workingEvent.participants
      .filter(
        (participant: Participant) =>
          participant.email === undefined || participant.email !== ''
      )
      .map((participant: Participant) => ({
        email: participant.email,
      })),
  };
}

function getEmailAdmin(): boolean {
  return workingEvent.details.emailAdmin === true;
}

async function setEmailAdmin(emailAdmin: boolean) {
  workingEvent.details.emailAdmin = emailAdmin;
  // Update only the emailAdmin field to avoid issues with undefined optional fields
  const eventsRef = collection(db, 'events');
  await updateDoc(doc(eventsRef, workingEvent.publicId), {
    'details.emailAdmin': emailAdmin,
  });
}

async function getSelectedCalendarIDsByUserID(uid: string): Promise<string[]> {
  // Guests have no user document
  if (!uid) return [];
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().selectedCalendarIDs || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching selected calendars:', error);
    return [];
  }
}

async function setUserSelectedCalendarIDs(uid: string, calIDs: string[]) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { selectedCalendarIDs: calIDs }, { merge: true });
  } catch (error) {
    console.error('Error setting selected calendars:', error);
  }
}

export { workingEvent }; // For interal use; use getters and setters below

export {
  // Firebase Wrappers
  getAccountId,
  getAccountName,
  getAccountEmail,
  checkIfLoggedIn,
  checkIfAdmin,
  isLiteEvent,
  getExpireAt,

  // Misc
  getSelectedCalendarIDsByUserID,
  setUserSelectedCalendarIDs,

  // High Level (Async)
  getEventOnPageload,
  getEventById,
  createEvent,
  getParsedAccountPageEventsForUser,

  // Getters (Sync)
  getDates,
  getUTCDates,
  getUTCStartAndEndTimes,
  getStartAndEndTimes,
  getChosenLocation,
  getChosenDayAndTime,
  getAllAvailabilities,
  getAllAvailabilitiesNames,
  getAllAvailabilitiesIDs,
  getAvailabilityByAccountId,
  getAvailabilityByName,
  getEventDescription,
  getEventName,
  getLocationOptions,
  getLocationsVotes,
  getEventObjectForGCal,
  getZoomLink,
  getTimezone,
  getEmailAdmin,

  // All Participants (Async)
  wrappedSaveParticipantDetails,
  wrappedSaveDeclinedParticipantDetails,
  updateAnonymousUserToAuthUser,
  // setAvailability,
  // setLocationPreference,

  // Admin Only (Async)
  deleteEvent,
  setEmailAdmin,
  getParticipantIndex
};

function dateToArray(obj: Record<number, Date>): Date[] {
  const result: Date[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push((obj[key] as unknown as Timestamp).toDate());
    }
  }
  return result;
}

import {
  calendarDimensions,
  calendarState,
  userData,
  calendar,
  calendarDate,
  Availability,
  Location,
  Event,
  EventMode,
} from '../types';
import {
  createEvent,
  getAllAvailabilities,
  getAllAvailabilitiesNames,
  getAllAvailabilitiesIDs,
  getDates,
  getStartAndEndTimes,
} from './events';
import {
  doc,
  collection,
  updateDoc,
  getDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { parseAvailability } from './parsing';
import { generateTimeBlocks } from '../components/utils/functions/generateTimeBlocks';
import { getUserTimezone } from '../components/utils/functions/timzoneConversions';

// TODO fetch event details -> calendarFramework

const getShortDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

const getMonth = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

export default class FrontendEventAPI {
  /**
   *
   * Returns an empty avaliability for a single user that conforms
   * to a specific calendar dimension.
   *
   * @param dims
   * @returns Availability type
   */
  static getEmptyAvailability(dims: calendarDimensions): Availability {
    const blocksLength =
      generateTimeBlocks(dims.startTime, dims.endTime).length * 4;
    // One all-false row per date
    return dims.dates
      .flat()
      .map(() => Array.from({ length: blocksLength }, () => false));
  }

  /**
   *
   * Creates a new event in the backend. Events are objects that contain information that can form
   * a calendarFramework.
   *
   * @param title
   * @param description
   * @param adminName
   * @param adminAccountId
   * @param dates
   * @param plausibleLocations
   * @param startTime
   * @param endTime
   * @param zoomLink
   * @param timeZone
   * @param dateCreated
   * @param mode 'lite' for events created without signing in; these have no admin
   * @returns Promise object that expands to a Event object.
   */
  static async createNewEvent(
    title: string,
    description: string,
    adminName: string,
    adminAccountId: string,
    dates: Date[],
    plausibleLocations: Location[],
    startTime: Date,
    endTime: Date,
    zoomLink: string = '',
    timeZone: string,
    dateCreated: Date,
    mode: EventMode = 'full'
  ): Promise<Event | null> {
    try {
      return await createEvent({
        name: title,
        description,
        adminName,
        // Lite events have no admin; Firestore rules require this to be empty
        adminAccountId: mode === 'lite' ? '' : adminAccountId,
        // Firestore rejects undefined fields, so only set the mode for lite events
        ...(mode === 'lite' ? { mode } : {}),
        dates,
        startTime,
        endTime,
        plausibleLocations, // TODO admin creator is not being added; maybe should be done on time select?
        zoomLink: zoomLink,
        timeZone: timeZone,
        participants: [],
        dateCreated: dateCreated,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Updates an existing event's details
   * @param eventId The public ID of the event to update
   * @param title
   * @param description
   * @param dates
   * @param plausibleLocations
   * @param startTime
   * @param endTime
   * @param zoomLink
   * @param timeZone
   * @returns Promise that resolves when update is complete
   */
  static async updateEvent(
    eventId: string,
    title: string,
    description: string,
    dates: Date[],
    plausibleLocations: Location[],
    startTime: Date,
    endTime: Date,
    zoomLink: string = '',
    timeZone: string
  ): Promise<void> {
    try {
      // Validate that at least one date is provided
      if (!dates || dates.length === 0) {
        throw new Error('At least one date must be selected for the event');
      }

      const normalizedId = eventId.toUpperCase();
      const eventsRef = doc(collection(db, 'events'), normalizedId);
      const {
        dates: currentDates,
        startTime: oldStartTime,
        endTime: oldEndTime,
      } = await fetchEventDetails(eventsRef);

      // Check what changed
      const needsDateRemapping = !datesEqual(currentDates, dates);
      const needsTimeRemapping = timeframeChanged(
        { start: oldStartTime, end: oldEndTime },
        { start: startTime, end: endTime }
      );

      // If dates or timeframe changed, update availability
      if (needsDateRemapping || needsTimeRemapping) {
        const participantsRef = collection(eventsRef, 'participants');
        const participantsSnapshot: QuerySnapshot<DocumentData> =
          await getDocs(participantsRef);

        // Generate time blocks
        const oldTimeBlocks = generateTimeBlocks(oldStartTime, oldEndTime);
        const newTimeBlocks = generateTimeBlocks(startTime, endTime);
        const flatOldBlocks = oldTimeBlocks.flat().flat();
        const flatNewBlocks = newTimeBlocks.flat().flat();

        // Create date mapping: map old date string to old date index
        const oldDateToIndex = lookupTable(currentDates);

        // Generate empty availability for new structure
        const emptyAvailability: Availability = Array.from(
          { length: dates.length },
          () => flatNewBlocks.map(() => false)
        );

        // Process each participant
        const updatePromises = participantsSnapshot.docs.map((participantDoc) =>
          updateParticipant(
            participantDoc,
            emptyAvailability,
            needsDateRemapping,
            needsTimeRemapping,
            oldTimeBlocks,
            newTimeBlocks,
            flatOldBlocks,
            flatNewBlocks,
            dates,
            currentDates,
            oldDateToIndex
          )
        );

        await Promise.all(updatePromises);
      }

      // Update the event details directly using updateDoc
      await updateDoc(eventsRef, {
        'details.name': title,
        'details.description': description,
        'details.dates': dates,
        'details.startTime': startTime,
        'details.endTime': endTime,
        'details.plausibleLocations': plausibleLocations,
        'details.zoomLink': zoomLink,
        'details.timeZone': timeZone,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   *
   * Obtain the calendar dimension from the working event.
   *
   * @returns
   */
  static getCalendarDimensions(): calendarDimensions {
    const theDates: Date[] = [...getDates()].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const theCalendarDates: calendarDate[][] = [];
    let curCalendarBucket: calendarDate[] = [];
    const numOfCols = theDates.length;

    const startAndEndTimes = getStartAndEndTimes();
    const numOfBlocks =
      startAndEndTimes.length > 0
        ? generateTimeBlocks(startAndEndTimes[0], startAndEndTimes[1]).length *
          4
        : 0;

    // if its a general day
    if (theDates[0].getFullYear() === 2000) {
      for (let i = 0; i < theDates.length; i++) {
        if (i == 0) {
          curCalendarBucket.push({
            id: i,
            shortenedWeekDay: getShortDay[theDates[i].getDay()],
            calendarDay: '',
            month: '\u00A0', // Unicode non-breaking space
            date: theDates[i],
          });
        } else {
          if (theDates[i].getDay() - theDates[i - 1].getDay() > 1) {
            theCalendarDates.push([...curCalendarBucket]);
            curCalendarBucket = [
              {
                id: i,
                shortenedWeekDay: getShortDay[theDates[i].getDay()],
                calendarDay: '',
                month: '\u00A0', // Unicode non-breaking space
                date: theDates[i],
              },
            ];
          } else {
            curCalendarBucket.push({
              id: i,
              shortenedWeekDay: getShortDay[theDates[i].getDay()],
              calendarDay: '',
              month: '',
              date: theDates[i],
            });
          }
        }
      }

      if (curCalendarBucket.length > 0) {
        theCalendarDates.push(curCalendarBucket);
      }
    } else {
      for (let i = 0; i < theDates.length; i++) {
        if (i === 0) {
          curCalendarBucket.push({
            id: i,
            shortenedWeekDay: getShortDay[theDates[i].getDay()],
            calendarDay: theDates[i].getDate().toString(),
            month: getMonth[theDates[i].getMonth()],
            date: theDates[i],
          });
        } else {
          const isSameYear =
            theDates[i].getFullYear() === theDates[i - 1].getFullYear();
          const isSameMonth =
            theDates[i].getMonth() === theDates[i - 1].getMonth();

          if (
            isSameYear &&
            isSameMonth &&
            Math.abs(theDates[i].getDate() - theDates[i - 1].getDate()) <= 1
          ) {
            curCalendarBucket.push({
              id: i,
              shortenedWeekDay: getShortDay[theDates[i].getDay()],
              calendarDay: theDates[i].getDate().toString(),
              month: getMonth[theDates[i].getMonth()],
              date: theDates[i],
            });
          } else {
            theCalendarDates.push([...curCalendarBucket]);
            curCalendarBucket = [
              {
                id: i,
                shortenedWeekDay: getShortDay[theDates[i].getDay()],
                calendarDay: theDates[i].getDate().toString(),
                month: getMonth[theDates[i].getMonth()],
                date: theDates[i],
              },
            ];
          }
        }
      }

      if (curCalendarBucket.length > 0) {
        theCalendarDates.push(curCalendarBucket);
      }
    }

    return {
      dates: theCalendarDates,
      startTime: getStartAndEndTimes()[0],
      endTime: getStartAndEndTimes()[1],
      numOfBlocks,
      numOfCols,
      timezone: getUserTimezone(),
    };
  }

  /**
   *
   * Obtain a calendar object from the working event, and contains the calendarState and the chartedUsers.
   *
   * @returns
   */
  static getCalendar(): calendar {
    const avails = getAllAvailabilities();
    const names = getAllAvailabilitiesNames();
    const ids = getAllAvailabilitiesIDs();

    const userData: userData = {
      users: [],
      userIDs: [],
      available: [],
      unavailable: [],
    };

    for (let i = 0; i < names.length; i++) {
      userData.users.push({
        name: names[i],
        id: i,
      });
    }

    for (let i = 0; i < ids.length; i++) {
      userData.userIDs.push(ids[i]);
    }

    const availMatrix: calendarState = [];
    for (let i = 0; i < avails.length; i++) {
      availMatrix.push(avails[i]);
    }

    return {
      availabilities: availMatrix,
      participants: userData,
    };
  }
}

/**
 * Convert a group of dates from Firestore to a JavaScript date array.
 *
 * Handles both arrays and Records since Firestore might store dates as Record.
 */
function toDates(rawDates: unknown): Date[] {
  if (Array.isArray(rawDates)) {
    return rawDates.map(convertToDate);
  } else if (rawDates && typeof rawDates === 'object') {
    // It's a Record - convert to array (similar to dateToArray in events.ts)
    return Object.values(rawDates).map((date: any) => {
      if (date && date.seconds !== undefined) {
        return new Timestamp(date.seconds, date.nanoseconds || 0).toDate();
      }
      return convertToDate(date);
    });
  }
  return [];
}

interface EventDetails {
  dates: Date[];
  startTime: Date;
  endTime: Date;
}

async function fetchEventDetails(
  eventsRef: DocumentReference<DocumentData>
): Promise<EventDetails> {
  const currentEventDoc = await getDoc(eventsRef);
  const currentDatesRaw = currentEventDoc.data()?.details?.dates || [];
  const rawStartTime = currentEventDoc.data()?.details?.startTime;
  const rawEndTime = currentEventDoc.data()?.details?.endTime;

  const dates = toDates(currentDatesRaw);
  const startTime = convertToDate(rawStartTime);
  const endTime = convertToDate(rawEndTime);
  return { dates, startTime, endTime };
}

/** Convert Firestore Timestamps to Date objects if needed. */
function convertToDate(date: any): Date {
  if (date instanceof Date) return date;
  if (date && typeof date.toDate === 'function') return date.toDate();
  if (date && date.seconds)
    return new Timestamp(date.seconds, date.nanoseconds || 0).toDate();
  return new Date(date);
}

/**
 * Compare date sets (ignoring order, comparing only date part)
 * @returns true only if both arrays have the same set of dates
 */
function datesEqual(dates1: Date[], dates2: Date[]): boolean {
  // If lengths differ, dates definitely changed
  if (dates1.length !== dates2.length) {
    return false;
  }

  const set1 = new Set(dates1.map(normalizeDate));
  const set2 = new Set(dates2.map(normalizeDate));

  // If set sizes differ, dates changed
  if (set1.size !== set2.size) {
    return false;
  }

  // Check if all dates in set1 are in set2
  for (const dateStr of set1) {
    if (!set2.has(dateStr)) {
      return false;
    }
  }

  return true;
}

/** Converts a date to YYYY-MM-DD fromat. */
function normalizeDate(d: Date): string {
  const date = convertToDate(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * A span between two dates.
 */
interface Timeframe {
  start: Date;
  end: Date;
}

/**
 * Determines whether two timeframes are different. Only considers hours and minutes.
 */
function timeframeChanged(oldTimeframe: Timeframe, newTimeframe: Timeframe) {
  return (
    oldTimeframe.start.getHours() !== newTimeframe.start.getHours() ||
    oldTimeframe.start.getMinutes() !== newTimeframe.start.getMinutes() ||
    oldTimeframe.end.getHours() !== newTimeframe.end.getHours() ||
    oldTimeframe.end.getMinutes() !== newTimeframe.end.getMinutes()
  );
}

/**
 * Creates a map from stringified dates to their positions in the given array.
 *
 * @remarks
 * Stringification is based on `normalizeDate`. Uses the last index for each date if there are
 * duplicates.
 */
function lookupTable(dates: Date[]): Map<string, number> {
  const map = new Map<string, number>();
  dates.forEach((date, i) => {
    map.set(normalizeDate(date), i);
  });
  return map;
}

async function updateParticipant(
  participantDoc: QueryDocumentSnapshot<DocumentData>,
  emptyAvailability: Availability,
  needsDateRemapping: boolean,
  needsTimeRemapping: boolean,
  oldTimeBlocks: string[][][],
  newTimeBlocks: string[][][],
  flatOldBlocks: string[],
  flatNewBlocks: string[],
  dates: Date[],
  currentDates: Date[],
  oldDateToIndex: Map<string, number>
): Promise<void> {
  const participantData = participantDoc.data();
  try {
    let rawAvailability = participantData.availability;

    // Compensate for old double-stringification.
    if (typeof rawAvailability === 'string') {
      try {
        rawAvailability = JSON.parse(rawAvailability);
      } catch {
        rawAvailability = undefined;
      }
    }
    const oldAvailability = parseAvailability(rawAvailability || '[]');
    if (oldAvailability === undefined) {
      console.warn(`Failed to parse availability for ${participantData.name}, using empty`);
      return updateDoc(participantDoc.ref, {
        availability: JSON.stringify(emptyAvailability),
      });
    }

    // Empty arrays are valid - just means no availability set yet
    // Update structure to match new timeframe/dates but keep it empty
    if (oldAvailability.length === 0) {
      return updateDoc(participantDoc.ref, {
        availability: JSON.stringify(emptyAvailability),
      });
    }

    const oldDatesCount = oldAvailability.length;
    const oldBlocksPerDate = oldAvailability[0]?.length ?? 0;

    // Check for corruption
    const MAX_REASONABLE_DATES = 1000;
    const MAX_REASONABLE_BLOCKS = 1000;

    if (
      oldDatesCount > MAX_REASONABLE_DATES ||
      oldBlocksPerDate > MAX_REASONABLE_BLOCKS
    ) {
      console.warn(
        `Corrupted availability for ${participantData.name}, using empty`
      );
      return updateDoc(participantDoc.ref, {
        availability: JSON.stringify(emptyAvailability),
      });
    }

    const normalizedAvailability = normalize(
      oldAvailability,
      needsTimeRemapping,
      oldDatesCount,
      flatOldBlocks,
      oldBlocksPerDate,
      currentDates
    );

    // Validate date count matches old dates (allow small discrepancy)
    if (
      needsTimeRemapping &&
      Math.abs(normalizedAvailability.length - currentDates.length) > 10
    ) {
      console.warn(
        `Date count mismatch for ${participantData.name} (${normalizedAvailability.length} vs ${currentDates.length}), using empty`
      );
      return updateDoc(participantDoc.ref, {
        availability: JSON.stringify(emptyAvailability),
      });
    }

    const newAvailability = remap(
      normalizedAvailability,
      needsDateRemapping,
      needsTimeRemapping,
      oldTimeBlocks,
      newTimeBlocks,
      flatOldBlocks,
      flatNewBlocks,
      dates,
      oldDateToIndex
    );

    // Validate size before saving
    const jsonString = JSON.stringify(newAvailability);
    const sizeInBytes = new Blob([jsonString]).size;
    const MAX_SIZE_BYTES = 900000;

    if (sizeInBytes > MAX_SIZE_BYTES) {
      console.warn(
        `Availability too large for ${participantData.name} (${sizeInBytes} bytes), using empty`
      );
      return updateDoc(participantDoc.ref, {
        availability: JSON.stringify(emptyAvailability),
      });
    }

    return updateDoc(participantDoc.ref, {
      availability: JSON.stringify(newAvailability),
    });
  } catch (participantError) {
    console.error(
      `Error updating availability for ${participantData.name}:`,
      participantError
    );
    // On error, use empty availability
    return updateDoc(participantDoc.ref, {
      availability: JSON.stringify(emptyAvailability),
    });
  }
}

function normalize(
  availability: Availability,
  needsTimeRemapping: boolean,
  oldDatesCount: number,
  flatOldBlocks: string[],
  oldBlocksPerDate: number,
  currentDates: Date[]
): Availability {
  if (
    needsTranspose(
      needsTimeRemapping,
      oldDatesCount,
      flatOldBlocks,
      oldBlocksPerDate,
      currentDates
    )
  ) {
    return transpose(availability, oldDatesCount, oldBlocksPerDate);
  }
  return availability;
}

function needsTranspose(
  needsTimeRemapping: boolean,
  oldDatesCount: number,
  flatOldBlocks: string[],
  oldBlocksPerDate: number,
  currentDates: Date[]
): boolean {
  return (
    needsTimeRemapping &&
    oldDatesCount === flatOldBlocks.length &&
    oldBlocksPerDate > 0 &&
    oldBlocksPerDate === currentDates.length &&
    oldBlocksPerDate !== flatOldBlocks.length
  );
}

function transpose(
  availability: Availability,
  newBlocks: number,
  newDates: number
): Availability {
  return Array.from({ length: newDates }, (_, date) =>
    Array.from(
      { length: newBlocks },
      (_, block) => availability[block]?.[date] === true
    )
  );
}

function remap(
  availability: Availability,
  needsDateRemapping: boolean,
  needsTimeRemapping: boolean,
  oldTimeBlocks: string[][][],
  newTimeBlocks: string[][][],
  flatOldBlocks: string[],
  flatNewBlocks: string[],
  dates: Date[],
  oldDateToIndex: Map<string, number>
) {
  if (needsDateRemapping && needsTimeRemapping) {
    return remapDatesAndTimes(
      availability,
      oldTimeBlocks,
      newTimeBlocks,
      dates,
      oldDateToIndex
    );
  } else if (needsDateRemapping) {
    return remapDates(
      availability,
      flatNewBlocks.length,
      dates,
      oldDateToIndex
    );
  } else if (needsTimeRemapping) {
    return remapTimes(
      availability,
      dates.length,
      flatOldBlocks.length,
      oldTimeBlocks,
      newTimeBlocks
    );
  }
  return availability;
}

function remapDatesAndTimes(
  availability: Availability,
  oldTimeBlocks: string[][][],
  newTimeBlocks: string[][][],
  dates: Date[],
  oldDateToIndex: Map<string, number>
) {
  const absoluteTimesByOldDate = indicesToAbsoluteTimes(
    availability,
    oldTimeBlocks
  );
  const absoluteTimesByNewDate = Array.from(
    { length: dates.length },
    (_, newIdx) => {
      const newDateStr = normalizeDate(dates[newIdx]);
      const oldIdx = oldDateToIndex.get(newDateStr);

      if (oldIdx !== undefined && oldIdx < absoluteTimesByOldDate.length) {
        return new Set(absoluteTimesByOldDate[oldIdx]);
      } else {
        return new Set<string>();
      }
    }
  );

  return absoluteTimesToIndices(
    absoluteTimesByNewDate,
    newTimeBlocks,
    dates.length
  );
}

function remapDates(
  availability: Availability,
  blockCount: number,
  dates: Date[],
  oldDateToIndex: Map<string, number>
) {
  return Array.from({ length: dates.length }, (_, newIdx) => {
    const newDateStr = normalizeDate(dates[newIdx]);
    const oldIdx = oldDateToIndex.get(newDateStr);

    if (oldIdx !== undefined && oldIdx < availability.length) {
      const oldAvailability = availability[oldIdx];
      if (oldAvailability.length === blockCount) {
        return oldAvailability.slice();
      } else {
        return Array.from(
          { length: blockCount },
          (_, i) => oldAvailability[i] ?? false
        );
      }
    } else {
      return Array.from({ length: blockCount }, () => false);
    }
  });
}

function remapTimes(
  availability: Availability,
  expectedDateCount: number,
  blockCount: number,
  oldTimeBlocks: string[][][],
  newTimeBlocks: string[][][]
) {
  const trimmedAvailability: Availability = [];
  for (let i = 0; i < expectedDateCount; i++) {
    if (i < availability.length) {
      trimmedAvailability.push(availability[i]);
    } else {
      trimmedAvailability.push(Array.from({ length: blockCount }, () => false));
    }
  }

  const absoluteTimes = indicesToAbsoluteTimes(
    trimmedAvailability,
    oldTimeBlocks
  );
  return absoluteTimesToIndices(
    absoluteTimes,
    newTimeBlocks,
    expectedDateCount
  );
}

/** Converts time block indices to absolute times. */
function indicesToAbsoluteTimes(
  availability: Availability,
  oldTimeBlocks: string[][][]
): Set<string>[] {
  const absoluteTimes: Set<string>[] = [];

  // Flatten old time blocks to get a simple array of times
  const flatOldBlocks: string[] = [];
  for (const group of oldTimeBlocks) {
    for (const hourBlocks of group) {
      flatOldBlocks.push(...hourBlocks);
    }
  }

  // For each date column
  for (let colIdx = 0; colIdx < availability.length; colIdx++) {
    const timesForDate = new Set<string>();
    const column = availability[colIdx];

    // For each block in this date column
    for (let blockIdx = 0; blockIdx < column.length; blockIdx++) {
      if (column[blockIdx] === true && blockIdx < flatOldBlocks.length) {
        // Get the absolute time for this block
        const absoluteTime = flatOldBlocks[blockIdx];
        timesForDate.add(absoluteTime);
      }
    }

    absoluteTimes.push(timesForDate);
  }

  return absoluteTimes;
}

/** Converts absolute times to time block indices. */
function absoluteTimesToIndices(
  absoluteTimes: Set<string>[],
  newTimeBlocks: string[][][],
  numDates: number
): Availability {
  // Flatten new time blocks
  const flatNewBlocks: string[] = [];
  for (const group of newTimeBlocks) {
    for (const hourBlocks of group) {
      flatNewBlocks.push(...hourBlocks);
    }
  }

  // Create a map from time string to block index
  const timeToIndex = new Map<string, number>();
  flatNewBlocks.forEach((time, idx) => {
    timeToIndex.set(time, idx);
  });

  // Build new availability array
  const newAvailability: Availability = [];
  for (let colIdx = 0; colIdx < numDates; colIdx++) {
    const column = flatNewBlocks.map(() => false);

    if (colIdx < absoluteTimes.length) {
      const times = absoluteTimes[colIdx];
      times.forEach((time) => {
        const newIdx = timeToIndex.get(time);
        if (newIdx !== undefined && newIdx < column.length) {
          column[newIdx] = true;
        }
      });
    }

    newAvailability.push(column);
  }

  return newAvailability;
}

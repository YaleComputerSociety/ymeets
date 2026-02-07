import {
  calendarDimensions,
  calanderState,
  userData,
  calendar,
  calandarDate,
  Availability,
  Location,
  Event,
} from '../types';
import {
  createEvent,
  getAllAvailabilities,
  getAllAvailabilitiesNames,
  getAllAvailabilitiesIDs,
  getDates,
  getStartAndEndTimes,
} from './events';
import { doc, collection, updateDoc, getDoc, getDocs, Timestamp, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { generateTimeBlocks } from '../components/utils/functions/generateTimeBlocks';
import { getUserTimezone } from '../components/utils/functions/timzoneConversions';

// TODO fetch event details -> calendarFramework

interface testData {
  userData: userData;
  scheduleDataEmpty: calanderState;
  scheduleDataFull: calanderState;
  dateData: calendarDimensions;
}

// frontendEventAPI().method()

export default class FrontendEventAPI {
  /**
   *
   * Returns an empty avaliability for a single user that conforms
   * to a specific calander dimension.
   *
   * @param dims
   * @returns Availability type
   */
  static getEmptyAvailability(dims: calendarDimensions): Availability {
    const blocksLength =
      generateTimeBlocks(dims.startTime, dims.endTime).length * 4;
    const days: boolean[][] = [];
    for (let i = 0; i < dims.dates.length; i++) {
      for (let k = 0; k < dims.dates[i].length; k++) {
        days.push(Array.from({ length: blocksLength }, () => false));
      }
    }

    return days;
  }

  /**
   *
   * Creates a new event in the backend. Events are objects that contain information that can form
   * a calanderFramework.
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
    dateCreated: Date
  ): Promise<Event | null> {
    try {
      const ev: Event | null = await createEvent({
        name: title,
        description,
        adminName,
        adminAccountId,
        dates,
        startTime,
        endTime,
        plausibleLocations, // TODO admin creator is not being added; maybe should be done on time select?
        zoomLink: zoomLink,
        timeZone: timeZone,
        participants: [],
        dateCreated: dateCreated,
      });

      return ev;
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
      
      // Normalize to match reads which use toUpperCase() when fetching
      const normalizedId = eventId.toUpperCase();
      const eventsRef = doc(collection(db, 'events'), normalizedId);
      
      // Check if dates have changed by comparing with current event
      const currentEventDoc = await getDoc(eventsRef);
      const currentDatesRaw = currentEventDoc.data()?.details?.dates || [];
      const currentStartTime = currentEventDoc.data()?.details?.startTime;
      const currentEndTime = currentEventDoc.data()?.details?.endTime;
      
      // Convert Firestore Timestamps to Date objects if needed
      const convertToDate = (date: any): Date => {
        if (date instanceof Date) return date;
        if (date && typeof date.toDate === 'function') return date.toDate();
        if (date && date.seconds) return new Timestamp(date.seconds, date.nanoseconds || 0).toDate();
        return new Date(date);
      };
      
      // Convert current start/end times to Date objects
      const oldStartTime = convertToDate(currentStartTime);
      const oldEndTime = convertToDate(currentEndTime);
      
      // Check if timeframe (start/end time) has changed
      const timeframeChanged = 
        oldStartTime.getHours() !== startTime.getHours() ||
        oldStartTime.getMinutes() !== startTime.getMinutes() ||
        oldEndTime.getHours() !== endTime.getHours() ||
        oldEndTime.getMinutes() !== endTime.getMinutes();
      
      // Handle both array and Record formats (Firestore might store dates as Record)
      let currentDates: Date[] = [];
      if (Array.isArray(currentDatesRaw)) {
        currentDates = currentDatesRaw.map(convertToDate);
      } else if (currentDatesRaw && typeof currentDatesRaw === 'object') {
        // It's a Record - convert to array (similar to dateToArray in events.ts)
        currentDates = Object.values(currentDatesRaw).map((date: any) => {
          if (date && date.seconds !== undefined) {
            return new Timestamp(date.seconds, date.nanoseconds || 0).toDate();
          }
          return convertToDate(date);
        });
      }
      
      // Helper function to compare date sets (ignoring order, comparing only date part)
      // Returns true only if both arrays have the same set of dates
      const datesEqual = (dates1: Date[], dates2: Date[]): boolean => {
        // If lengths differ, dates definitely changed
        if (dates1.length !== dates2.length) {
          return false;
        }
        
        // Normalize dates to YYYY-MM-DD format for comparison
        const normalizeDate = (d: Date): string => {
          const date = convertToDate(d);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
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
      };
      
      // Helper function to convert time block indices to absolute times
      const indicesToAbsoluteTimes = (
        availability: boolean[][],
        oldTimeBlocks: string[][][]
      ): Set<string>[] => {
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
      };
      
      // Helper function to convert absolute times back to indices
      const absoluteTimesToIndices = (
        absoluteTimes: Set<string>[],
        newTimeBlocks: string[][][],
        numDates: number
      ): boolean[][] => {
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
        const newAvailability: boolean[][] = [];
        for (let colIdx = 0; colIdx < numDates; colIdx++) {
          const column = new Array(flatNewBlocks.length).fill(false);
          
          if (colIdx < absoluteTimes.length) {
            const times = absoluteTimes[colIdx];
            times.forEach(time => {
              const newIdx = timeToIndex.get(time);
              if (newIdx !== undefined && newIdx < column.length) {
                column[newIdx] = true;
              }
            });
          }
          
          newAvailability.push(column);
        }
        
        return newAvailability;
      };
      
      // Check what changed
      const datesChanged = !datesEqual(currentDates, dates);
      const needsDateMapping = datesChanged;
      const needsTimeRemapping = timeframeChanged;
      
      // Helper to normalize date to YYYY-MM-DD string
      const normalizeDateStr = (d: Date): string => {
        const date = convertToDate(d);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // If dates or timeframe changed, update availability
      if (needsDateMapping || needsTimeRemapping) {
        const participantsRef = collection(eventsRef, 'participants');
        const participantsSnapshot: QuerySnapshot<DocumentData> = await getDocs(participantsRef);
        
        // Generate time blocks
        const oldTimeBlocks = generateTimeBlocks(oldStartTime, oldEndTime);
        const newTimeBlocks = generateTimeBlocks(startTime, endTime);
        const flatOldBlocks = oldTimeBlocks.flat().flat();
        const flatNewBlocks = newTimeBlocks.flat().flat();
        
        // Create date mapping: map old date string to old date index
        const oldDateToIndex = new Map<string, number>();
        currentDates.forEach((date, idx) => {
          oldDateToIndex.set(normalizeDateStr(date), idx);
        });
        
        // Generate empty availability for new structure
        const emptyAvailability: Availability = [];
        for (let i = 0; i < dates.length; i++) {
          emptyAvailability.push(Array.from({ length: flatNewBlocks.length }, () => false));
        }
        
          // Process each participant
          const updatePromises = participantsSnapshot.docs.map(async (participantDoc: QueryDocumentSnapshot<DocumentData>) => {
            const participantData = participantDoc.data();
            try {
              const rawAvailability = participantData.availability;
              
              // Parse old availability
              let oldAvailability: Availability;
              try {
                // Handle both string and already-parsed array
                if (typeof rawAvailability === 'string') {
                  // Parse once
                  let parsed = JSON.parse(rawAvailability || '[]');
                  
                  // Handle double-stringification (from before the fix)
                  // If we got a string after parsing, it was double-stringified
                  if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                  }
                  
                  oldAvailability = parsed;
                } else if (Array.isArray(rawAvailability)) {
                  oldAvailability = rawAvailability;
                } else {
                  console.warn(`Unexpected availability type for ${participantData.name}, using empty`);
                  oldAvailability = [];
                }
              } catch (parseError) {
                console.warn(`Failed to parse availability for ${participantData.name}, using empty:`, parseError);
                return updateDoc(participantDoc.ref, {
                  availability: JSON.stringify(emptyAvailability),
                });
              }

              // Validate structure
              if (!Array.isArray(oldAvailability)) {
                console.warn(`Invalid availability for ${participantData.name}, using empty`);
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
            
            if (oldDatesCount > MAX_REASONABLE_DATES || oldBlocksPerDate > MAX_REASONABLE_BLOCKS) {
              console.warn(`Corrupted availability for ${participantData.name}, using empty`);
              return updateDoc(participantDoc.ref, {
                availability: JSON.stringify(emptyAvailability),
              });
            }

            let normalizedAvailability: boolean[][] = oldAvailability;

            // Detect and fix transposed data [block][date] -> [date][block]
            if (
              needsTimeRemapping && // Only check if we're remapping times
              oldDatesCount === flatOldBlocks.length &&
              oldBlocksPerDate > 0 &&
              oldBlocksPerDate === currentDates.length &&
              oldBlocksPerDate !== flatOldBlocks.length
            ) {
              const numBlocks = oldDatesCount;
              const numDates = oldBlocksPerDate;
              const transposed: boolean[][] = [];
              for (let d = 0; d < numDates; d++) {
                const col: boolean[] = new Array(numBlocks).fill(false);
                for (let b = 0; b < numBlocks; b++) {
                  if (oldAvailability[b] && oldAvailability[b][d] !== undefined) {
                    col[b] = oldAvailability[b][d] === true;
                  }
                }
                transposed.push(col);
              }
              normalizedAvailability = transposed;
            }

            // Validate date count matches old dates (allow small discrepancy)
            if (needsTimeRemapping && Math.abs(normalizedAvailability.length - currentDates.length) > 10) {
              console.warn(`Date count mismatch for ${participantData.name} (${normalizedAvailability.length} vs ${currentDates.length}), using empty`);
              return updateDoc(participantDoc.ref, {
                availability: JSON.stringify(emptyAvailability),
              });
            }

            let newAvailability: boolean[][] = [];

            if (needsDateMapping && needsTimeRemapping) {
              // Both changed: map dates AND remap times
              // Step 1: Convert old availability to absolute times per date
              const absoluteTimesByOldDate = indicesToAbsoluteTimes(normalizedAvailability, oldTimeBlocks);
              
              // Step 2: Map absolute times to new dates
              const absoluteTimesByNewDate: Set<string>[] = [];
              for (let newIdx = 0; newIdx < dates.length; newIdx++) {
                const newDateStr = normalizeDateStr(dates[newIdx]);
                const oldIdx = oldDateToIndex.get(newDateStr);
                
                if (oldIdx !== undefined && oldIdx < absoluteTimesByOldDate.length) {
                  // Date exists in both old and new - preserve its availability
                  absoluteTimesByNewDate.push(new Set(absoluteTimesByOldDate[oldIdx]));
                } else {
                  // New date - start with empty availability
                  absoluteTimesByNewDate.push(new Set());
                }
              }
              
              // Step 3: Convert absolute times to new time block indices
              newAvailability = absoluteTimesToIndices(absoluteTimesByNewDate, newTimeBlocks, dates.length);
              
            } else if (needsDateMapping) {
              // Only dates changed: map dates, keep same times
              // Map availability from old dates to new dates
              // Since timeframe didn't change, old and new blocks should be the same length
              const blocksLength = flatNewBlocks.length;
              newAvailability = [];
              for (let newIdx = 0; newIdx < dates.length; newIdx++) {
                const newDateStr = normalizeDateStr(dates[newIdx]);
                const oldIdx = oldDateToIndex.get(newDateStr);
                
                if (oldIdx !== undefined && oldIdx < normalizedAvailability.length) {
                  // Date exists in both - copy availability (times haven't changed)
                  // Ensure the array length matches (should be same, but pad/trim if needed)
                  const oldAvail = normalizedAvailability[oldIdx];
                  if (oldAvail.length === blocksLength) {
                    newAvailability.push([...oldAvail]);
                  } else {
                    // Length mismatch - pad or trim to match
                    const adjusted: boolean[] = [];
                    for (let i = 0; i < blocksLength; i++) {
                      adjusted.push(i < oldAvail.length ? oldAvail[i] : false);
                    }
                    newAvailability.push(adjusted);
                  }
                } else {
                  // New date - empty availability
                  newAvailability.push(Array.from({ length: blocksLength }, () => false));
                }
              }
              
            } else if (needsTimeRemapping) {
              // Only timeframe changed: remap times, keep same dates
              // Trim/pad to match expected date count (use dates.length since dates didn't change)
              const expectedDateCount = dates.length;
              const trimmedAvailability: boolean[][] = [];
              for (let i = 0; i < expectedDateCount; i++) {
                if (i < normalizedAvailability.length) {
                  trimmedAvailability.push(normalizedAvailability[i]);
                } else {
                  // Pad with empty row if we have fewer dates than expected
                  trimmedAvailability.push(Array.from({ length: flatOldBlocks.length }, () => false));
                }
              }
              
              // Convert to absolute times and back to new time blocks
              const absoluteTimes = indicesToAbsoluteTimes(trimmedAvailability, oldTimeBlocks);
              newAvailability = absoluteTimesToIndices(absoluteTimes, newTimeBlocks, expectedDateCount);
            } else {
              // Nothing changed - shouldn't happen, but just use old availability
              newAvailability = normalizedAvailability;
            }

            // Validate size before saving
            const jsonString = JSON.stringify(newAvailability);
            const sizeInBytes = new Blob([jsonString]).size;
            const MAX_SIZE_BYTES = 900000;
            
            if (sizeInBytes > MAX_SIZE_BYTES) {
              console.warn(`Availability too large for ${participantData.name} (${sizeInBytes} bytes), using empty`);
              return updateDoc(participantDoc.ref, {
                availability: JSON.stringify(emptyAvailability),
              });
            }
            
            return updateDoc(participantDoc.ref, {
              availability: JSON.stringify(newAvailability),
            });
          } catch (participantError) {
            console.error(`Error updating availability for ${participantData.name}:`, participantError);
            // On error, use empty availability
            return updateDoc(participantDoc.ref, {
              availability: JSON.stringify(emptyAvailability),
            });
          }
        });
        
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
   * Obtain the calander dimension from the working event.
   *
   * @returns
   */
  static getCalendarDimensions(): calendarDimensions {
    const theDates: Date[] = getDates();
    const theCalendarDates: calandarDate[][] = [];
    let curCalendarBucket: calandarDate[] = [];
    const numOfCols = theDates.length;

    const startAndEndTimes = getStartAndEndTimes();
    const numOfBlocks =
      startAndEndTimes.length > 0
        ? generateTimeBlocks(startAndEndTimes[0], startAndEndTimes[1]).length *
          4
        : 0;

    const getShortDay: { [key: number]: string } = {
      0: 'SUN',
      1: 'MON',
      2: 'TUE',
      3: 'WED',
      4: 'THU',
      5: 'FRI',
      6: 'SAT',
    };

    const getMonth: { [key: number]: string } = {
      0: 'JAN',
      1: 'FEB',
      2: 'MAR',
      3: 'APR',
      4: 'MAY',
      5: 'JUN',
      6: 'JUL',
      7: 'AUG',
      8: 'SEP',
      9: 'OCT',
      10: 'NOV',
      11: 'DEC',
    };

    // if its a general day
    if (theDates[0].getFullYear() === 2000) {
      for (let i = 0; i < theDates.length; i++) {
        if (i == 0) {
          curCalendarBucket.push({
            id: i,
            shortenedWeekDay: getShortDay[theDates[i].getDay()],
            calanderDay: '',
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
                calanderDay: '',
                month: '\u00A0', // Unicode non-breaking space
                date: theDates[i],
              },
            ];
          } else {
            curCalendarBucket.push({
              id: i,
              shortenedWeekDay: getShortDay[theDates[i].getDay()],
              calanderDay: '',
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
            calanderDay: theDates[i].getDate().toString(),
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
              calanderDay: theDates[i].getDate().toString(),
              month: getMonth[theDates[i].getMonth()],
              date: theDates[i],
            });
          } else {
            theCalendarDates.push([...curCalendarBucket]);
            curCalendarBucket = [
              {
                id: i,
                shortenedWeekDay: getShortDay[theDates[i].getDay()],
                calanderDay: theDates[i].getDate().toString(),
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
      timezone: getUserTimezone()
    };
  }

  /**
   *
   * Obtain a calander object from the working event, and contains the calanderState and the chartedUsers.
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

    const availMatrix: calanderState = [];
    for (let i = 0; i < avails.length; i++) {
      availMatrix.push(avails[i]);
    }

    return {
      availabilities: availMatrix,
      participants: userData,
    };
  }

  static getCalendarWithSelectNames(selectNames: string[]): calendar {
    const avails = getAllAvailabilities();
    const names = getAllAvailabilitiesNames();

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

    const availMatrix: calanderState = [];
    for (let i = 0; i < avails.length; i++) {
      availMatrix.push(avails[i]);
    }

    return {
      availabilities: availMatrix,
      participants: userData,
    };
  }
}

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
  getDates,
  getStartAndEndTimes,
} from './events';
import { generateTimeBlocks } from '../components/utils/functions/generateTimeBlocks';

// TODO fetch event details -> calendarFramework

interface testData {
  userData: userData;
  scheduleDataEmpty: calanderState;
  scheduleDataFull: calanderState;
  dateData: calendarDimensions;
}

// frontendEventAPI().method()

export default class FrontendEventAPI {
  constructor() {}

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
    zoomLink: string = ''
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
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      return ev;
    } catch (error) {
      console.error('Error creating event:', error);
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

    const userData: userData = {
      users: [],
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

  static getCalendarWithSelectNames(selectNames: string[]): calendar {
    const avails = getAllAvailabilities();
    const names = getAllAvailabilitiesNames();

    const userData: userData = {
      users: [],
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

import { calandarDate } from '../../../types';

export function datesToCalendarDates(dates: Date[]): calandarDate[][] {
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

  const calendarBuckets: calandarDate[][] = [];
  let currentBucket: calandarDate[] = [];

  if (dates[0]?.getFullYear() === 2000) {
    // General day case
    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      const previousDate = dates[i - 1];

      if (i === 0 || currentDate.getDay() - previousDate?.getDay() > 1) {
        if (currentBucket.length > 0) {
          calendarBuckets.push([...currentBucket]);
        }
        currentBucket = [
          {
            id: i,
            shortenedWeekDay: getShortDay[currentDate.getDay()],
            calanderDay: '',
            month: '\u00A0', // Unicode non-breaking space
            date: currentDate,
          },
        ];
      } else {
        currentBucket.push({
          id: i,
          shortenedWeekDay: getShortDay[currentDate.getDay()],
          calanderDay: '',
          month: '',
          date: currentDate,
        });
      }
    }
  } else {
    // Normal date case
    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      const previousDate = dates[i - 1];

      const isSameYear =
        previousDate?.getFullYear() === currentDate.getFullYear();
      const isSameMonth = previousDate?.getMonth() === currentDate.getMonth();
      const isConsecutiveDay =
        Math.abs(currentDate.getDate() - previousDate?.getDate()) <= 1;

      if (i === 0 || !(isSameYear && isSameMonth && isConsecutiveDay)) {
        if (currentBucket.length > 0) {
          calendarBuckets.push([...currentBucket]);
        }
        currentBucket = [
          {
            id: i,
            shortenedWeekDay: getShortDay[currentDate.getDay()],
            calanderDay: currentDate.getDate().toString(),
            month: getMonth[currentDate.getMonth()],
            date: currentDate,
          },
        ];
      } else {
        currentBucket.push({
          id: i,
          shortenedWeekDay: getShortDay[currentDate.getDay()],
          calanderDay: currentDate.getDate().toString(),
          month: getMonth[currentDate.getMonth()],
          date: currentDate,
        });
      }
    }
  }

  // Push the last bucket
  if (currentBucket.length > 0) {
    calendarBuckets.push(currentBucket);
  }

  return calendarBuckets;
}

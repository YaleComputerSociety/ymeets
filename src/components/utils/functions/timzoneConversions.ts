import { DateTime } from 'luxon';
import { getTimezone, getUTCDates } from '../../../firebase/events';
import { timezones } from '../constants/timezones';

const getTimezoneOffset = (timezone: string) => {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  );
  return tzDate.getTime() - utcDate.getTime();
};

export function getUserTimezone() {
    
    const userTimezone =  Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Check if user's timezone is already in the list
    if (timezones.includes(userTimezone)) {
        return userTimezone;
    }
        
    const now = new Date();
    
    const userOffset = now.getTimezoneOffset() * -1; // Flip sign to match standard convention
    
    let closestTimezone = timezones[0];
    let smallestDifference = Infinity;
    
    // Compare with each timezone in the list
    timezones.forEach(tz => {
        try {
            const targetDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
            const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
            
            const targetOffset = (targetDate.getTime() - utcDate.getTime()) / (1000 * 60);
            
            const difference = Math.abs(userOffset - targetOffset);
            
            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestTimezone = tz;
            }
        } catch (error) {
            //@ts-ignore
            console.log(`Error processing ${tz}:`, error.message);
        }
    });
    
    return closestTimezone;
}

interface timezoneChangeParams {
  adjustedDates: Date[];
  adjustedStartTime: Date;
  adjustedEndTime: Date;
}

export const doTimezoneChange = (newTimezone: string, initialStartTime : Date, initialEndTime: Date) : timezoneChangeParams =>  {
  const initialTimezone = getTimezone();
  const oldOffset = getTimezoneOffset(initialTimezone); // oldOffset is the initial Timezone the creator set.
  const newOffset = getTimezoneOffset(newTimezone); // newTimezone the user wants to go to
  const offsetDiff = newOffset - oldOffset;

  let dates = getUTCDates();

  // Convert the start and end times to the NEW timezone
  const startInNewZone = DateTime.fromJSDate(
    initialStartTime
  ).setZone(newTimezone);
  const endInNewZone = DateTime.fromJSDate(initialEndTime).setZone(
    newTimezone
  );

  // Get the original DateTime objects in the creator's time zone
  const startInCreatorZone = DateTime.fromJSDate(
    initialStartTime
  ).setZone(initialTimezone);
  const endInCreatorZone = DateTime.fromJSDate(
    initialEndTime
  ).setZone(initialTimezone);

  let adjustedDates = [...dates];
  const startDateNewZone = startInNewZone?.toISODate();
  const startDateCreatorZone = startInCreatorZone?.toISODate();
  const endDateNewZone = endInNewZone?.toISODate();
  const endDateCreatorZone = endInCreatorZone?.toISODate();

  // Calculate how many days each boundary shifted
  const startDateShift =
    startDateNewZone && startDateCreatorZone
      ? DateTime.fromISO(startDateNewZone).diff(
          DateTime.fromISO(startDateCreatorZone),
          'days'
        ).days
      : 0;
  const endDateShift =
    endDateNewZone && endDateCreatorZone
      ? DateTime.fromISO(endDateNewZone).diff(
          DateTime.fromISO(endDateCreatorZone),
          'days'
        ).days
      : 0;

  if (startDateShift === endDateShift && startDateShift !== 0) {
    // Both boundaries shifted by the same amount - shift the entire array
    adjustedDates = adjustedDates.map((date) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + startDateShift);
      return newDate;
    });
    console.log('Both boundaries shifted by the same amount:', startDateShift);
  } else {
    // Different shifts - need to add/remove dates at boundaries
    if (startDateShift < 0) {
      // Start date moved backward - add dates at beginning
      const daysToAdd = Math.abs(startDateShift);
      for (let i = daysToAdd; i > 0; i--) {
        const firstDate = adjustedDates[0];
        const newDate = new Date(firstDate.getTime() - i * 86400000);
        adjustedDates.unshift(newDate);
      }
      console.log('Start date moved backward - added dates at beginning:', daysToAdd);
    }

    if (endDateShift > 0) {
      // End date moved forward - add dates at end
      const daysToAdd = endDateShift;
      for (let i = 1; i <= daysToAdd; i++) {
        const lastDate = adjustedDates[adjustedDates.length - 1];
        const newDate = new Date(lastDate.getTime() + i * 86400000);
        adjustedDates.push(newDate);
      }
      console.log('End date moved forward - added dates at end:', daysToAdd);
    }
  }

  return {
    adjustedDates,
    adjustedStartTime: new Date(initialStartTime.getTime() + offsetDiff),
    adjustedEndTime: new Date(initialEndTime.getTime() + offsetDiff)
  }
}
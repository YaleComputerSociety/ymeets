import React, { useState, useEffect } from 'react';
import { calendarDimensions } from '../../../types';
import { getDates, getStartAndEndTimes } from '../../../firebase/events';
import { DateTime } from 'luxon';
import { datesToCalendarDates } from '../functions/dateToCalendarDate';
import Dropdown from './Dropdown';
import { timezones } from '../constants/timezones';

interface TimezoneChangerProps {
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  initialTimezone: string;
}

const TimezoneChanger = ({
  theCalendarFramework,
  initialTimezone,
}: TimezoneChangerProps) => {
  const [initialStartTime, initialEndTime] = getStartAndEndTimes();
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

  const handleTimezoneChange = (newTimezone: string) => {
    setSelectedTimezone(newTimezone);

    // Calculate time difference between old and new timezone
    const oldOffset = getTimezoneOffset(initialTimezone); // oldOffset is the initial Timezone the creator set.
    const newOffset = getTimezoneOffset(newTimezone); // newTimezone the user wants to go to
    const offsetDiff = newOffset - oldOffset;

    let dates = getDates();

    // Treat the date as UTC and convert to the target timezone
    dates = dates.map((date) =>
      DateTime.fromJSDate(date, { zone: 'utc' })
        .setZone(newTimezone, { keepLocalTime: true }) // Fixed: use newTimezone
        .toJSDate()
    );

    // Convert the start and end times to the NEW timezone
    const startInNewZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(newTimezone);
    const endInNewZone = DateTime.fromJSDate(calendarFramework.endTime).setZone(
      newTimezone
    );

    // Get the original DateTime objects in the creator's time zone
    const startInCreatorZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(initialTimezone);
    const endInCreatorZone = DateTime.fromJSDate(
      calendarFramework.endTime
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
      }

      if (endDateShift > 0) {
        // End date moved forward - add dates at end
        const daysToAdd = endDateShift;
        for (let i = 1; i <= daysToAdd; i++) {
          const lastDate = adjustedDates[adjustedDates.length - 1];
          const newDate = new Date(lastDate.getTime() + i * 86400000);
          adjustedDates.push(newDate);
        }
      }
    }

    // Update calendar start and end times
    const updatedFramework = {
      ...calendarFramework,
      dates: datesToCalendarDates(adjustedDates),
      numOfCols: adjustedDates.length,
      startTime: new Date(initialStartTime.getTime() + offsetDiff),
      endTime: new Date(initialEndTime.getTime() + offsetDiff),
    };

    setCalendarFramework(updatedFramework);
  };

  // Helper function to get timezone offset in milliseconds
  const getTimezoneOffset = (timezone: string) => {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone })
    );
    return tzDate.getTime() - utcDate.getTime();
  };
  return (
    <div className="dark:text-text-dark">
      <Dropdown
        options={timezones}
        selectedOption={selectedTimezone}
        onSelect={handleTimezoneChange}
        placeholder="Select a timezone"
        renderOption={(option) => option.replace(/_/g, ' ')}
        className="bg-white dark:bg-secondary_background-dark"
        searchable={true}
      />
    </div>
  );
};

export default TimezoneChanger;

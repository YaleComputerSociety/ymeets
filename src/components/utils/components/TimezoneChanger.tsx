import React, { useState, useEffect } from 'react';
import { calendarDimensions } from '../../../types';
import { getDates } from '../../../backend/events';
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
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const [currentTime, setCurrentTime] = useState('');

  const handleTimezoneChange = (newTimezone: string) => {

    setSelectedTimezone(newTimezone);
    updateTime(newTimezone);

    // Calculate time difference between old and new timezone
    const oldOffset = getTimezoneOffset(selectedTimezone);
    const newOffset = getTimezoneOffset(newTimezone);
    const offsetDiff = newOffset - oldOffset;

    let dates = getDates();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Treat the date as UTC and convert to the target timezone
    dates = dates.map((date) =>
      DateTime.fromJSDate(date, { zone: 'utc' })
        .setZone(newTimezone, { keepLocalTime: true })
        .toJSDate()
    );

    // Convert the start and end times to the user's time zone
    const startInUserZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(userTimeZone);
    const endInUserZone = DateTime.fromJSDate(
      calendarFramework.endTime
    ).setZone(userTimeZone);

    // Get the original DateTime objects in the creator's time zone (without converting to ISO date)
    const startInCreatorZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(newTimezone);
    const endInCreatorZone = DateTime.fromJSDate(
      calendarFramework.endTime
    ).setZone(newTimezone);

    // Determine if the time range crosses into another day
    let adjustedDates = [...dates];
    const startDateUserZone = startInUserZone?.toISODate();
    const startDateCreatorZone = startInCreatorZone?.toISODate();
    const endDateUserZone = endInUserZone?.toISODate();
    const endDateCreatorZone = endInCreatorZone?.toISODate();

    if (
      startDateUserZone &&
      startDateCreatorZone &&
      startDateUserZone < startDateCreatorZone
    ) {
      // If the start date is earlier in the user's time zone (crosses backward)
      adjustedDates = adjustedDates.map((date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(date.getDate() - 1); // Shift the date backward by 1
        return adjustedDate;
      });
    } else if (
      endDateUserZone &&
      endDateCreatorZone &&
      endDateUserZone < endDateCreatorZone
    ) {
      // If the end date is later in the user's time zone (crosses forward)
      adjustedDates = adjustedDates.map((date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(date.getDate() + 1); // Shift the date forward by 1
        return adjustedDate;
      });
    }

    // Update calendar start and end times
    const updatedFramework = {
      ...calendarFramework,
      dates: datesToCalendarDates(adjustedDates),
      startTime: new Date(calendarFramework.startTime.getTime() + offsetDiff),
      endTime: new Date(calendarFramework.endTime.getTime() + offsetDiff),
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

  // Format current time in selected timezone
  const updateTime = (timezone: string) => {
    const time = new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setCurrentTime(time);
  };

  // Update time every second
  useEffect(() => {
    updateTime(selectedTimezone);
    const interval = setInterval(() => {
      updateTime(selectedTimezone);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  return (
    <div className="dark:text-text-dark">
      <Dropdown
        options={timezones}
        selectedOption={selectedTimezone}
        onSelect={handleTimezoneChange}
        placeholder="Select a timezone"
        renderOption={(option) => option.replace(/_/g, ' ')}
        className="bg-white dark:bg-secondary_background-dark"
      />
    </div>
  );
};

export default TimezoneChanger;

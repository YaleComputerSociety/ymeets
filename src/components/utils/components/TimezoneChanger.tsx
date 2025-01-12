import React, { useState } from 'react';
import { calendarDimensions } from '../../../types';

interface TimezonePickerProps {
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  initialTimezone: string;
}

const TimezoneChanger = ({
  theCalendarFramework,
  initialTimezone,
}: TimezonePickerProps) => {
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const [currentTime, setCurrentTime] = useState('');

  // Get list of all timezones
  const timezones = Intl.supportedValuesOf('timeZone');

  // Update time when timezone changes
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setSelectedTimezone(newTimezone);
    updateTime(newTimezone);

    // Calculate time difference between old and new timezone
    const oldOffset = getTimezoneOffset(selectedTimezone);
    const newOffset = getTimezoneOffset(newTimezone);
    const offsetDiff = newOffset - oldOffset;

    // Update calendar start and end times
    const updatedFramework = {
      ...calendarFramework,
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
  React.useEffect(() => {
    updateTime(selectedTimezone);
    const interval = setInterval(() => {
      updateTime(selectedTimezone);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  return (
    <div className="dark:text-text-dark ">
      <select
        value={selectedTimezone}
        onChange={handleTimezoneChange}
        className="w-full p-2 border rounded-md dark:bg-secondary_background-dark max-h-40 overflow-y-auto"
      >
        {timezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneChanger;

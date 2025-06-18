import React, { useState, useEffect } from 'react';
import { calendarDimensions } from '../../../types';
import {
  getDates,
  getStartAndEndTimes,
  getUTCDates,
  getUTCStartAndEndTimes,
} from '../../../firebase/events';
import { DateTime } from 'luxon';
import { datesToCalendarDates } from '../functions/dateToCalendarDate';
import Dropdown from './Dropdown';
import { timezones } from '../constants/timezones';
import { doTimezoneChange } from '../functions/timzoneConversions';

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
    const [startTime, endTime] = getUTCStartAndEndTimes();

    const { adjustedDates, adjustedStartTime, adjustedEndTime } =
      doTimezoneChange(newTimezone, startTime, endTime);

    // Update calendar start and end times
    const updatedFramework = {
      ...calendarFramework,
      dates: datesToCalendarDates(adjustedDates),
      numOfCols: adjustedDates.length,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
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

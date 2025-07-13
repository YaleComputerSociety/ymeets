import React, { useState, useEffect } from 'react';
import { calendarDimensions } from '../../../types';
import { getDates } from '../../../backend/events';
import { DateTime } from 'luxon';
import { datesToCalendarDates } from '../functions/dateToCalendarDate';
import Dropdown from './Dropdown';
import { timezones } from '../constants/timezones';
import { doTimezoneChange } from '../functions/timzoneConversions';
import { getUTCStartAndEndTimes } from '../../../backend/events';

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

  const handleTimezoneChange = (newTimezone: string) => {
    setSelectedTimezone(newTimezone);
    const [startTime, endTime] = getUTCStartAndEndTimes();

    const { adjustedDates, adjustedStartTime, adjustedEndTime } =
      doTimezoneChange(newTimezone, startTime, endTime);

    const updatedFramework = {
      ...calendarFramework,
      dates: datesToCalendarDates(adjustedDates),
      numOfCols: adjustedDates.length,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
    };

    setCalendarFramework(updatedFramework);
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

import React, { useState, useEffect } from 'react';
import { calendarDimensions } from '../../../types';
import { getDates } from '../../../firebase/events';
import { DateTime } from 'luxon';
import { datesToCalendarDates } from '../functions/dateToCalendarDate';
import Dropdown from './Dropdown';

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

  const timezones = [
    'Etc/GMT+12',
    'Pacific/Pago_Pago',
    'Pacific/Honolulu',
    'America/Anchorage',
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'America/Halifax',
    'America/Sao_Paulo',
    'Atlantic/Azores',
    'Etc/UTC',
    'Europe/London',
    'Europe/Paris',
    'Europe/Bucharest',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Dhaka',
    'Asia/Bangkok',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Guadalcanal',
    'Pacific/Auckland',
    'Pacific/Tongatapu',
    'Pacific/Kiritimati',
  ];

  const handleTimezoneChange = (newTimezone: string) => {
    setSelectedTimezone(newTimezone);
    updateTime(newTimezone);

    const oldOffset = getTimezoneOffset(selectedTimezone);
    const newOffset = getTimezoneOffset(newTimezone);
    const offsetDiff = newOffset - oldOffset;

    let dates = getDates();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    dates = dates.map((date) =>
      DateTime.fromJSDate(date, { zone: 'utc' })
        .setZone(newTimezone, { keepLocalTime: true })
        .toJSDate()
    );

    const startInUserZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(userTimeZone);
    const endInUserZone = DateTime.fromJSDate(
      calendarFramework.endTime
    ).setZone(userTimeZone);

    const startInCreatorZone = DateTime.fromJSDate(
      calendarFramework.startTime
    ).setZone(newTimezone);
    const endInCreatorZone = DateTime.fromJSDate(
      calendarFramework.endTime
    ).setZone(newTimezone);

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
      adjustedDates = adjustedDates.map((date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(date.getDate() - 1);
        return adjustedDate;
      });
    } else if (
      endDateUserZone &&
      endDateCreatorZone &&
      endDateUserZone < endDateCreatorZone
    ) {
      adjustedDates = adjustedDates.map((date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(date.getDate() + 1);
        return adjustedDate;
      });
    }

    const updatedFramework = {
      ...calendarFramework,
      dates: datesToCalendarDates(adjustedDates),
      startTime: new Date(calendarFramework.startTime.getTime() + offsetDiff),
      endTime: new Date(calendarFramework.endTime.getTime() + offsetDiff),
    };

    setCalendarFramework(updatedFramework);
  };

  const getTimezoneOffset = (timezone: string) => {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone })
    );
    return tzDate.getTime() - utcDate.getTime();
  };

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
      />
    </div>
  );
};

export default TimezoneChanger;

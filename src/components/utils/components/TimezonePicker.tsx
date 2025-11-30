import React from 'react';
import Dropdown from '../../utils/components/Dropdown';
import { timezones } from '../../utils/constants/timezones';

interface TimezonePickerProps {
  timezone: string;
  setTimezone: (timezone: string) => void;
}

const TimezonePicker: React.FC<TimezonePickerProps> = ({
  timezone,
  setTimezone,
}) => {
  return (
    <Dropdown
      options={timezones}
      selectedOption={timezone}
      onSelect={setTimezone}
      placeholder="Select a timezone"
      renderOption={(option) => option.replace(/_/g, ' ')}
      className="dark:bg-secondary_background-dark"
    />
  );
};

export default TimezonePicker;

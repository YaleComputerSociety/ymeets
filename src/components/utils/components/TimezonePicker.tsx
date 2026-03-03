import React from 'react';
import Dropdown from '../../utils/components/Dropdown';
import { timezones } from '../../utils/constants/timezones';
import { formatTimezoneLabel } from '../functions/timzoneConversions';

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
      renderOption={(option) => formatTimezoneLabel(option)}
      className="dark:bg-secondary_background-dark"
    />
  );
};

export default TimezonePicker;

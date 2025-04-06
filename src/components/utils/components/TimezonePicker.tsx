interface TimezonePickerProps {
  theTimezone: [string, React.Dispatch<React.SetStateAction<string>>];
}

function TimezonePicker({ theTimezone }: TimezonePickerProps) {
  const [timezone, setTimzeone] = theTimezone;

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Calcutta',
    'Australia/Sydney',
  ];

  return (
    <div className="text-primary w-full">
      <select
        value={timezone}
        onChange={(e) => {
          setTimzeone(e.target.value);
        }}
        className="w-full p-3 border dark:border-gray-600 rounded-md dark:bg-secondary_background-dark max-h-40 overflow-y-auto"
      >
        {timezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TimezonePicker;

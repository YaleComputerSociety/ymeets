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
        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-secondary_background-dark max-h-40 overflow-y-auto cursor-pointer"
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

import getShorterTimezonesList from '../functions/getShorterListofTimezones';

interface TimezonePickerProps {
  theTimezone: [string, React.Dispatch<React.SetStateAction<string>>];
}

function TimezonePicker({ theTimezone }: TimezonePickerProps) {
  const [timezone, setTimzeone] = theTimezone;
  const timezones = Intl.supportedValuesOf('timeZone');

  return (
    <div className="text-primary w-full">
      <select
        value={timezone}
        onChange={(e) => {
          setTimzeone(e.target.value);
        }}
        className="w-full p-3 border rounded-md dark:bg-secondary_background-dark max-h-40 overflow-y-auto cursor-pointer"
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

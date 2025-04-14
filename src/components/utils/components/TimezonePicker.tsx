interface TimezonePickerProps {
  theTimezone: [string, React.Dispatch<React.SetStateAction<string>>];
}

function TimezonePicker({ theTimezone }: TimezonePickerProps) {
  const [timezone, setTimzeone] = theTimezone;

  const timezones = [
    'Etc/GMT+12',                  // UTC−12:00 - Baker Island
    'Pacific/Pago_Pago',           // UTC−11:00 - Samoa
    'Pacific/Honolulu',            // UTC−10:00 - Hawaii
    'America/Anchorage',           // UTC−09:00 - Alaska
    'America/Los_Angeles',         // UTC−08:00 - Pacific Time (US & Canada)
    'America/Denver',              // UTC−07:00 - Mountain Time (US & Canada)
    'America/Chicago',             // UTC−06:00 - Central Time (US & Canada)
    'America/New_York',            // UTC−05:00 - Eastern Time (US & Canada)
    'America/Halifax',             // UTC−04:00 - Atlantic Time (Canada)
    'America/Argentina/Buenos_Aires', // UTC−03:00 - Argentina
    'Atlantic/South_Georgia',      // UTC−02:00 - South Georgia
    'Etc/UTC',                     // UTC±00:00 - UTC
    'Europe/Paris',                // UTC+01:00 - Central European Time
    'Europe/Bucharest',            // UTC+02:00 - Eastern European Time
    'Europe/Moscow',               // UTC+03:00 - Moscow
    'Asia/Dubai',                  // UTC+04:00 - UAE
    'Asia/Karachi',                // UTC+05:00 - Pakistan
    'Asia/Dhaka',                  // UTC+06:00 - Bangladesh
    'Asia/Bangkok',                // UTC+07:00 - Thailand
    'Asia/Shanghai',               // UTC+08:00 - China
    'Asia/Tokyo',                  // UTC+09:00 - Japan
    'Australia/Sydney',            // UTC+10:00 - Australia (East)
    'Pacific/Guadalcanal',         // UTC+11:00 - Solomon Islands
    'Pacific/Auckland',            // UTC+12:00 - New Zealand
    'Pacific/Tongatapu',           // UTC+13:00 - Tonga
    'Pacific/Kiritimati',          // UTC+14:00 - Line Islands
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

export default function getShorterTimezonesList() {
  const timezones = Intl.supportedValuesOf('timeZone');
  const uniqueOffsets = new Map();

  timezones.forEach((timezone) => {
    const offset = new Date()
      .toLocaleString('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      })
      .split(' ')
      .pop();

    if (!uniqueOffsets.has(offset)) {
      uniqueOffsets.set(offset, timezone); // Keep the first timezone for each offset
    }
  });

  return Array.from(uniqueOffsets.values());
}

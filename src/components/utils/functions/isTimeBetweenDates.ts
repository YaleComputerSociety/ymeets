export function isTimeBetweenDates(startEvent: any, endEvent: any, timeString: any, blockDurationMinutes = 15) {
  const [hours, minutes] = timeString.split(':').map(Number);

  if (!startEvent || !endEvent) return false;

  const startTime = new Date(startEvent.dateTime);
  const endTime = new Date(endEvent.dateTime);
  
  const eventDate = startEvent?.dateTime?.split('T')[0];
  const blockStartString = `${eventDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  const blockStart = new Date(blockStartString);
  const blockEnd = new Date(blockStart.getTime() + blockDurationMinutes * 60 * 1000);
  
  // Check for overlap: block overlaps with event if block_start < event_end AND block_end > event_start
  return blockStart < endTime && blockEnd > startTime;
}
export function isTimeBetweenDates(
  startDate: any,
  endDate: any,
  timeString: any
) {
  const [hours, minutes] = timeString.split(':').map(Number);

  if (startDate === null || endDate === null) {
    return false;
  }

  const startTime = new Date(startDate);
  const endTime = new Date(endDate);
  const checkTime = new Date(startDate);

  checkTime.setHours(hours, minutes, 0, 0);


  return startTime <= checkTime && checkTime < endTime;
}

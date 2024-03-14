export function isTimeBetweenDates(startDate, endDate, timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
  
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);
    const checkTime = new Date(startDate);

    checkTime.setHours(hours, minutes, 0, 0);
  
    return startTime <= checkTime && checkTime < endTime;
  }
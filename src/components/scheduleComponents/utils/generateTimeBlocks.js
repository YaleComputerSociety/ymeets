export function generateTimeBlocks(startHour, endHour) {
    const timeBlocks = [];
  
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;
  
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 15) {
      const hours = Math.floor(minutes / 60);
      const minutesInBlock = minutes % 60;
  
      // HH:mm (24-hour format)
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutesInBlock).padStart(2, '0')}`;
  
      timeBlocks.push(formattedTime);
    }
  
    return timeBlocks;
  }
  
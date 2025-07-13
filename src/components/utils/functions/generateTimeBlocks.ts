
export function generateTimeBlocks(startTime: any, endTime: any) {
  // Parse hours and minutes
  let startHour = startTime.getHours();
  let startMinute = startTime.getMinutes();
  let endHour = endTime.getHours();
  let endMinute = endTime.getMinutes();

  const timeBlocks2D = [];

  // Special case: 12 AM to 12 AM (full 24-hour period)
  const isFullDay = startHour === 0 && startMinute === 0 && endHour === 0 && endMinute === 0;

  // Loop through hours
  let hour = startHour;
  
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const hourBlocks = [];

    for (let i = 0; i < 4; i++) {
      const minutes = hour * 60 + i * 15;
      const currentHour = Math.floor(minutes / 60) % 24;
      const minutesInBlock = minutes % 60;

      const formattedHour = String(currentHour).padStart(2, '0');
      const formattedMinutes = String(minutesInBlock).padStart(2, '0');
      const formattedTime = `${formattedHour}:${formattedMinutes}`;

      hourBlocks.push(formattedTime);
    }

    timeBlocks2D.push(hourBlocks);

    // Break the loop when the end hour is fully processed
    if (hour === endHour && (!isFullDay || timeBlocks2D.length > 1)) {
      break;
    }

    hour = (hour + 1) % 24;
  }

  // Remove the last hour worth of blocks if it exceeds the end time
  if (timeBlocks2D.length > 0 && !isFullDay) {
    const lastBlock = timeBlocks2D[timeBlocks2D.length - 1];
    const lastTime = lastBlock[lastBlock.length - 1];
    const [lastHour, lastMinute] = lastTime.split(':').map(Number);

    if (
      (lastHour > endHour) ||
      (lastHour === endHour && lastMinute > endMinute)
    ) {
      timeBlocks2D.pop();
    }
  }

  // Group blocks if the time range crosses midnight
  if (startHour > endHour || (startHour === endHour && startMinute > endMinute)) {
    // Find the index where midnight (00:00) starts
    const midnightIndex = timeBlocks2D.findIndex(hourBlock => 
      hourBlock[0].startsWith('00:')
    );
    
    if (midnightIndex !== -1) {
      // Find where 01:00 starts (true after-midnight)
      const afterMidnightIndex = timeBlocks2D.findIndex(hourBlock => 
        hourBlock[0].startsWith('01:')
      );
      
      if (afterMidnightIndex !== -1) {
        // Split properly: after 12AM vs everything else
          const afterMidnight = timeBlocks2D.slice(midnightIndex);
          const beforeMidnight = timeBlocks2D.slice(0, midnightIndex);
        
        // Return grouped structure: [after-midnight hours, before-midnight hours]
        return [afterMidnight, beforeMidnight];
      } else {
        // No hours after 1AM, just group midnight with before-midnight
        const beforeMidnight = timeBlocks2D.slice(0, midnightIndex + 1);
        return [beforeMidnight];
      }
    }
  }

  // If no midnight crossing, return as single group
  return [timeBlocks2D];
}
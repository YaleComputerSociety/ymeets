export function generateTimeBlocks(startTime: any, endTime: any) {
  // Parse hours and minutes
  let startHour = startTime.getHours();
  let startMinute = startTime.getMinutes();
  let endHour = endTime.getHours();
  let endMinute = endTime.getMinutes();

  // Adjust for overnight range
  const isOvernight =
    startHour > endHour || (startHour === endHour && startMinute > endMinute);

  const timeBlocks2D = [];

  // Loop through hours, handling overnight wrapping
  for (
    let hour = startHour;
    hour !== (endHour + 1) % 24;
    hour = (hour + 1) % 24
  ) {
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
    if (!isOvernight && hour === endHour) break;
  }

  return timeBlocks2D;
}

export function generateTimeBlocks(startDate: any, endDate:any) {
  const startHour = startDate.getHours()
  // necessary to role 11:59 PM into 12:00AM
  const endHour = endDate.getMinutes() == 59 ? endDate.getHours() + 1 : endDate.getHours();

  const timeBlocks2D = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const hourBlocks = [];

    for (let i = 0; i < 4; i++) {
      const minutes = (hour * 60) + i * 15;
      const currentHour = Math.floor(minutes / 60);
      const minutesInBlock = minutes % 60;

      const formattedHour = String(currentHour).padStart(2, '0');
      const formattedMinutes = String(minutesInBlock).padStart(2, '0');
      const formattedTime = `${formattedHour}:${formattedMinutes}`;

      hourBlocks.push(formattedTime);
    }

    timeBlocks2D.push(hourBlocks);
  }

  return timeBlocks2D;
}

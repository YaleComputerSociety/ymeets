export function getDatesFromRange(startDate:any, endDate:any) {
    const dateWithDay = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    while (currentDate <= lastDate) {
      const dayOfWeek = daysOfWeek[currentDate.getDay()];
      dateWithDay.push({ date: new Date(currentDate), dayOfWeek });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateWithDay;
}
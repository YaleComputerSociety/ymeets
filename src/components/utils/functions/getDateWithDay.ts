export function getDateWithDay(singleDate: any) {
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Create a new Date object with the input date in the local time zone
    const currentDate = new Date(singleDate + 'T00:00:00');

    // Get the day of the week in the correct time zone
    const dayOfWeek = daysOfWeek[currentDate.getUTCDay()];

    return { date: currentDate, dayOfWeek };
}
